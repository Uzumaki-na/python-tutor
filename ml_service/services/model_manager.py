from sentence_transformers import SentenceTransformer, util
import torch
from typing import List, Dict, Any, Optional
import os
import json
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import time
from functools import wraps
import logging
from datetime import datetime, timedelta
from fastapi import HTTPException

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RateLimiter:
    def __init__(self, calls_per_hour=50):
        self.calls_per_hour = calls_per_hour
        self.calls = []
        
    def can_make_call(self) -> bool:
        now = datetime.now()
        # Remove calls older than 1 hour
        self.calls = [call_time for call_time in self.calls 
                     if now - call_time < timedelta(hours=1)]
        return len(self.calls) < self.calls_per_hour
    
    def add_call(self):
        self.calls.append(datetime.now())
    
    def time_until_next_call(self) -> Optional[float]:
        if self.can_make_call():
            return 0
        oldest_call = min(self.calls)
        return (oldest_call + timedelta(hours=1) - datetime.now()).total_seconds()

def rate_limit(func):
    @wraps(func)
    def wrapper(self, *args, **kwargs):
        if not hasattr(self, 'rate_limiter'):
            self.rate_limiter = RateLimiter()
        
        if not self.rate_limiter.can_make_call():
            wait_time = self.rate_limiter.time_until_next_call()
            logger.warning(f"Rate limit reached. Please wait {wait_time:.0f} seconds.")
            return {"error": f"Rate limit reached. Please wait {wait_time:.0f} seconds."}
        
        self.rate_limiter.add_call()
        return func(self, *args, **kwargs)
    return wrapper

def retry_with_backoff(retries=3, backoff_in_seconds=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            x = 0
            while True:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if x == retries:
                        raise e
                    sleep = (backoff_in_seconds * 2 ** x)
                    logger.warning(f"Retry {x + 1}/{retries} after {sleep}s sleep due to: {str(e)}")
                    time.sleep(sleep)
                    x += 1
        return wrapper
    return decorator

class ModelManager:
    def __init__(self):
        # Initialize with a smaller sentence transformer model
        self.model_name = "paraphrase-MiniLM-L3-v2"  # Smaller model
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.cache_dir = os.path.join(os.path.dirname(__file__), "../cache")
        os.makedirs(self.cache_dir, exist_ok=True)
        
        self.batch_size = 32  # For batch processing
        self.rate_limiter = RateLimiter()
        
        self.model: Optional[SentenceTransformer] = None
        self.last_error_time: float = 0
        self.error_count: int = 0
        self.max_retries: int = 3
        self.cooldown_period: int = 3600  # 1 hour in seconds
        self.is_in_cooldown: bool = False
        self.fallback_responses: Dict[str, Any] = self._load_fallback_responses()
        
        logger.info(f"Loading model on {self.device}...")
        self._load_model_with_retry()
        
        # Load exercise templates
        self.templates = self._load_exercise_templates()
        self.template_embeddings = self._load_or_compute_embeddings()

    def _load_fallback_responses(self) -> Dict[str, Any]:
        """Load fallback responses for when the model is unavailable"""
        return {
            "exercise_generation": {
                "basic": {
                    "title": "Basic Python Variables",
                    "description": "Create a simple program using variables",
                    "template": """# Create variables for:
# 1. Your name
# 2. Your age
# 3. Print a message using these variables

# Write your code below:
""",
                    "solution": """name = "Student"
age = 20
print(f"Hello, my name is {name} and I am {age} years old.")""",
                    "hints": ["Remember to use appropriate variable names",
                            "String variables need quotes",
                            "Use f-strings for formatted output"]
                }
            }
        }

    @retry_with_backoff(retries=3)
    def _load_model_with_retry(self):
        """Load the model with retry logic"""
        try:
            # Try to load model in offline mode first
            self.model = SentenceTransformer(
                self.model_name,
                cache_folder=self.cache_dir,
                device=self.device
            )
        except Exception as e:
            logger.warning(f"Failed to load model in offline mode: {str(e)}")
            # Try online mode with specific parameters
            self.model = SentenceTransformer(
                self.model_name,
                cache_folder=self.cache_dir,
                device=self.device,
                use_auth_token=None
            )
        self.model.to(self.device)

    def _handle_model_error(self, error: Exception) -> None:
        """Handle model errors and implement cooldown if needed"""
        current_time = time.time()
        self.error_count += 1
        
        if "rate limit exceeded" in str(error).lower():
            self.is_in_cooldown = True
            self.last_error_time = current_time
            remaining_cooldown = self._get_remaining_cooldown()
            raise HTTPException(
                status_code=429,
                detail=f"Model is temporarily unavailable. Please try again in {remaining_cooldown} minutes.",
                headers={"Retry-After": str(remaining_cooldown * 60)}
            )
        
        if self.error_count >= self.max_retries:
            self.is_in_cooldown = True
            self.last_error_time = current_time
            raise HTTPException(
                status_code=503,
                detail="Service temporarily unavailable. Using fallback responses."
            )

    def _get_remaining_cooldown(self) -> int:
        """Get remaining cooldown time in minutes"""
        if not self.is_in_cooldown:
            return 0
        elapsed = time.time() - self.last_error_time
        remaining = max(0, self.cooldown_period - elapsed)
        return int(remaining / 60)  # Convert to minutes

    def get_fallback_exercise(self, difficulty: str = "basic") -> Dict[str, Any]:
        """Get a fallback exercise when the model is unavailable"""
        return self.fallback_responses["exercise_generation"][difficulty]

    async def initialize_model(self) -> None:
        """Initialize the model if not already loaded"""
        if self.model is None and not self.is_in_cooldown:
            try:
                self.model = SentenceTransformer('all-MiniLM-L6-v2')
                self.error_count = 0
                self.is_in_cooldown = False
            except Exception as e:
                logger.error(f"Failed to initialize model: {str(e)}")
                self._handle_model_error(e)

    def _load_exercise_templates(self) -> List[Dict[str, Any]]:
        """Load exercise templates from JSON file"""
        template_file = os.path.join(os.path.dirname(__file__), "../data/exercise_templates.json")
        try:
            with open(template_file, "r") as f:
                data = json.load(f)
                return data["templates"]
        except Exception as e:
            logger.error(f"Error loading templates: {str(e)}")
            return []

    def _load_or_compute_embeddings(self) -> Dict[str, torch.Tensor]:
        """Load embeddings from cache or compute if not available"""
        cache_file = os.path.join(self.cache_dir, "template_embeddings.pt")
        
        if os.path.exists(cache_file):
            try:
                logger.info("Loading cached embeddings...")
                return torch.load(cache_file, map_location=self.device)
            except Exception as e:
                logger.warning(f"Failed to load cached embeddings: {str(e)}")
        
        logger.info("Computing embeddings...")
        embeddings = self._compute_template_embeddings()
        
        try:
            torch.save(embeddings, cache_file)
            logger.info("Saved embeddings to cache")
        except Exception as e:
            logger.warning(f"Failed to cache embeddings: {str(e)}")
        
        return embeddings

    def process_text_batch(self, texts: List[str]) -> List[torch.Tensor]:
        """Process texts in batches to avoid rate limits"""
        embeddings = []
        for i in range(0, len(texts), self.batch_size):
            batch = texts[i:i + self.batch_size]
            batch_embeddings = self.model.encode(batch, convert_to_tensor=True)
            embeddings.extend(batch_embeddings)
            # Add small delay between batches
            time.sleep(0.1)
        return embeddings

    @retry_with_backoff(retries=2)
    def _compute_template_embeddings(self) -> Dict[str, torch.Tensor]:
        """Compute embeddings for all templates with retry logic"""
        embeddings = {}
        texts = []
        keys = []
        
        for template in self.templates:
            for example in template["examples"]:
                key = f"{template['topic']}_{template['difficulty']}_{example['action']}"
                text = f"{template['topic']} {template['difficulty']} {example['action']} {example['concept']}"
                texts.append(text)
                keys.append(key)
        
        # Process in batches
        embedded_texts = self.process_text_batch(texts)
        
        for key, embedding in zip(keys, embedded_texts):
            embeddings[key] = embedding
            
        return embeddings

    @rate_limit
    async def generate_exercise(self, topic: str, difficulty: str, context: Optional[str] = None) -> Dict[str, Any]:
        """Generate a Python exercise based on topic and difficulty"""
        try:
            if self.is_in_cooldown:
                remaining = self._get_remaining_cooldown()
                if remaining > 0:
                    logger.warning(f"Model in cooldown. {remaining} minutes remaining.")
                    return self.get_fallback_exercise(difficulty)
                self.is_in_cooldown = False

            await self.initialize_model()
            # Encode the query
            query = f"{topic} {difficulty}"
            if context:
                query += f" {context}"
            query_embedding = self.model.encode(query, convert_to_tensor=True)

            # Find most similar template
            max_similarity = -1
            selected_template = None
            selected_example = None

            for template in self.templates:
                if template["topic"].lower() == topic.lower() and template["difficulty"].lower() == difficulty.lower():
                    for example in template["examples"]:
                        key = f"{template['topic']}_{template['difficulty']}_{example['action']}"
                        if key in self.template_embeddings:
                            similarity = util.pytorch_cos_sim(
                                query_embedding,
                                self.template_embeddings[key]
                            ).item()

                            if similarity > max_similarity:
                                max_similarity = similarity
                                selected_template = template
                                selected_example = example

            if selected_template and selected_example:
                return {
                    "topic": selected_template["topic"],
                    "difficulty": selected_template["difficulty"],
                    "question": selected_example["question"],
                    "hints": selected_example.get("hints", []),
                    "solution": selected_example.get("solution", ""),
                    "test_cases": selected_example.get("test_cases", [])
                }
            else:
                return {
                    "error": "No suitable exercise found for the given criteria"
                }
        except Exception as e:
            logger.error(f"Error generating exercise: {str(e)}")
            self._handle_model_error(e)
            return self.get_fallback_exercise(difficulty)

    async def validate_solution(self, exercise_id: str, solution: str) -> Dict[str, Any]:
        """Validate a submitted solution"""
        try:
            # Find the exercise template
            exercise = None
            for template in self.templates:
                for example in template["examples"]:
                    if f"{template['topic']}_{template['difficulty']}_{example['action'].replace(' ', '_')}" == exercise_id:
                        exercise = example
                        break
                if exercise:
                    break

            if not exercise:
                raise Exception("Exercise not found")

            # Create a safe execution environment
            results = []
            for test_case in exercise["test_cases"]:
                try:
                    # Create a new namespace for each test case
                    namespace = {}
                    
                    # Execute the solution code
                    exec(solution, namespace)
                    
                    # Execute the test input
                    exec(test_case["input"], namespace)
                    
                    # Get the result
                    # Note: This is simplified - in practice, you'd want to capture the output
                    # and compare it with the expected output more robustly
                    actual_output = str(eval(test_case["input"].split("=")[0].strip(), namespace))
                    passed = actual_output.strip() == test_case["expected_output"].strip()
                    
                    results.append(passed)
                    
                except Exception as e:
                    results.append(False)

            return {
                "is_correct": all(results),
                "feedback": "All test cases passed!" if all(results) else "Some test cases failed. Check your solution.",
                "passed_test_cases": results,
                "execution_time": 0.1,  # Placeholder - implement actual timing
                "memory_usage": None
            }
            
        except Exception as e:
            return {
                "is_correct": False,
                "feedback": f"Error validating solution: {str(e)}",
                "passed_test_cases": [],
                "execution_time": 0,
                "memory_usage": None
            }

    def _generate_from_template(self, template: Dict[str, Any], example: Dict[str, Any], topic: str, difficulty: str, context: str = None) -> Dict[str, Any]:
        """Generate an exercise from a template and example"""
        # Generate the exercise question
        question = template["template"].format(action=example["action"], concept=example["concept"])
        
        # Add context if provided
        if context:
            question = f"{question}\n\nContext: {context}"

        return {
            "id": f"{topic}_{difficulty}_{example['action'].replace(' ', '_')}",
            "topic": topic,
            "difficulty": difficulty,
            "question": question,
            "hints": [
                f"Think about how to use {example['concept']}",
                "Break down the problem into smaller steps",
                "Consider edge cases in your solution"
            ],
            "test_cases": example["test_cases"],
            "context": context
        }
