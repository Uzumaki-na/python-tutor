from typing import Dict, List, Any, Optional
import asyncio
import uuid
from datetime import datetime
from models.schemas import Exercise, TestCase, Difficulty, ValidationResult
from .model_manager import ModelManager
from .storage_manager import StorageManager
import random
from sentence_transformers import SentenceTransformer
import numpy as np
import re

class ExerciseGenerator:
    def __init__(self, model_manager: ModelManager):
        self.model_manager = model_manager
        self.storage_manager = StorageManager()
        self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.exercise_templates = {
            "basic": [
                {
                    "type": "code_completion",
                    "template": "Complete the following code to {task}:\n\n{code_snippet}\n\n# Your code here",
                    "tasks": [
                        "print all numbers from 1 to {n}",
                        "calculate the sum of a list of numbers",
                        "find the largest number in a list",
                        "check if a number is even or odd",
                        "convert a string to uppercase",
                        "create a list of squares from 1 to {n}",
                        "count vowels in a string",
                        "reverse a string",
                        "check if a number is prime",
                        "find common elements in two lists"
                    ]
                },
                {
                    "type": "debug",
                    "template": "Fix the bug in this code:\n\n{buggy_code}\n\nThe code should {expected_behavior}",
                    "bugs": [
                        ("print(Hello World!)", "print('Hello World!')", "print a greeting"),
                        ("x == 5", "x = 5", "assign the value 5 to variable x"),
                        ("for i in range[5]:", "for i in range(5):", "iterate 5 times"),
                        ("if x = 10:", "if x == 10:", "check if x equals 10"),
                        ("lst = [1,2,3]\nprint(lst[3])", "lst = [1,2,3]\nprint(lst[2])", "print the last element"),
                        ("def add(x,y)\n    return x+y", "def add(x,y):\n    return x+y", "define a function that adds two numbers")
                    ]
                },
                {
                    "type": "multiple_choice",
                    "template": "What will be the output of this code?\n\n{code}\n\nChoose the correct answer:",
                    "questions": [
                        {
                            "code": "x = 5\ny = 2\nprint(x + y)",
                            "options": ["7", "52", "Error", "None"],
                            "correct": 0
                        },
                        {
                            "code": "name = 'Python'\nprint(len(name))",
                            "options": ["5", "6", "4", "Error"],
                            "correct": 1
                        },
                        {
                            "code": "x = [1, 2, 3]\nx.append(4)\nprint(len(x))",
                            "options": ["3", "4", "5", "Error"],
                            "correct": 1
                        },
                        {
                            "code": "x = 10\ny = '5'\nprint(x + y)",
                            "options": ["15", "105", "Error", "None"],
                            "correct": 2
                        }
                    ]
                }
            ],
            "intermediate": [
                {
                    "type": "implementation",
                    "template": "Implement a function that {task}. Use the following signature:\n\n{function_signature}",
                    "tasks": [
                        {
                            "task": "calculates the factorial of a number",
                            "signature": "def factorial(n: int) -> int:"
                        },
                        {
                            "task": "reverses a string without using built-in functions",
                            "signature": "def reverse_string(s: str) -> str:"
                        },
                        {
                            "task": "finds all prime numbers up to n",
                            "signature": "def find_primes(n: int) -> List[int]:"
                        },
                        {
                            "task": "checks if a string is a palindrome",
                            "signature": "def is_palindrome(s: str) -> bool:"
                        },
                        {
                            "task": "finds the longest common subsequence of two strings",
                            "signature": "def longest_common_subsequence(s1: str, s2: str) -> str:"
                        },
                        {
                            "task": "implements a binary search",
                            "signature": "def binary_search(arr: List[int], target: int) -> int:"
                        }
                    ]
                },
                {
                    "type": "code_analysis",
                    "template": "What is the time complexity of this function? Explain your answer:\n\n{code}",
                    "examples": [
                        {
                            "code": "def find_duplicate(nums):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] == nums[j]:\n                return nums[i]\n    return None",
                            "complexity": "O(n²)",
                            "explanation": "The function uses nested loops"
                        },
                        {
                            "code": "def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1",
                            "complexity": "O(log n)",
                            "explanation": "The function uses binary search which halves the search space in each iteration"
                        }
                    ]
                }
            ],
            "advanced": [
                {
                    "type": "system_design",
                    "template": "Design a {system} with the following requirements:\n\n{requirements}\n\nProvide:\n1. Class structure\n2. Key methods\n3. Example usage",
                    "systems": [
                        {
                            "name": "caching system",
                            "requirements": "- Support get/put operations\n- Implement LRU eviction\n- Thread-safe operations"
                        },
                        {
                            "name": "event dispatcher",
                            "requirements": "- Support publish/subscribe pattern\n- Allow multiple subscribers\n- Asynchronous event handling"
                        },
                        {
                            "name": "rate limiter",
                            "requirements": "- Implement token bucket algorithm\n- Support different time windows\n- Thread-safe operations"
                        },
                        {
                            "name": "connection pool",
                            "requirements": "- Manage database connections\n- Support connection reuse\n- Handle timeouts and errors"
                        }
                    ]
                },
                {
                    "type": "optimization",
                    "template": "Optimize this code for better {optimization_type}:\n\n{code}\n\nRequirements:\n{requirements}",
                    "scenarios": [
                        {
                            "type": "performance",
                            "code": "def find_pairs(nums, target):\n    result = []\n    for i in range(len(nums)):\n        for j in range(len(nums)):\n            if i != j and nums[i] + nums[j] == target:\n                result.append((nums[i], nums[j]))\n    return result",
                            "requirements": "- Reduce time complexity\n- Maintain readability\n- Handle edge cases"
                        },
                        {
                            "type": "memory",
                            "code": "def get_all_substrings(s):\n    result = []\n    for i in range(len(s)):\n        for j in range(i + 1, len(s) + 1):\n            result.append(s[i:j])\n    return result",
                            "requirements": "- Reduce memory usage\n- Use generators\n- Maintain functionality"
                        }
                    ]
                }
            ]
        }

    def _extract_relevant_content(self, content: str, topic: Optional[str] = None) -> str:
        """Extract content relevant to the topic using semantic search"""
        if not content or not topic:
            return content

        # Split content into paragraphs
        paragraphs = content.split('\n\n')
        
        # Encode topic and paragraphs
        topic_embedding = self.sentence_model.encode(topic, convert_to_tensor=True)
        paragraph_embeddings = self.sentence_model.encode(paragraphs, convert_to_tensor=True)
        
        # Calculate similarities
        similarities = np.dot(paragraph_embeddings, topic_embedding)
        
        # Get most relevant paragraphs (top 3)
        top_indices = np.argsort(similarities)[-3:]
        relevant_content = '\n\n'.join([paragraphs[i] for i in top_indices])
        
        return relevant_content

    def _determine_difficulty(self, content: str) -> str:
        """Determine content difficulty based on various factors"""
        # Keywords indicating difficulty
        difficulty_indicators = {
            'basic': ['print', 'variable', 'if', 'for', 'while', 'list', 'string'],
            'intermediate': ['function', 'class', 'object', 'method', 'dictionary', 'exception'],
            'advanced': ['decorator', 'generator', 'metaclass', 'async', 'await', 'context manager']
        }
        
        # Count occurrences of difficulty indicators
        scores = {level: 0 for level in difficulty_indicators}
        content_lower = content.lower()
        
        for level, keywords in difficulty_indicators.items():
            for keyword in keywords:
                scores[level] += len(re.findall(r'\b' + keyword + r'\b', content_lower))
        
        # Weight the scores (advanced keywords count more)
        weighted_scores = {
            'basic': scores['basic'],
            'intermediate': scores['intermediate'] * 1.5,
            'advanced': scores['advanced'] * 2
        }
        
        # Return the difficulty level with highest weighted score
        return max(weighted_scores.items(), key=lambda x: x[1])[0]

    async def generate(self, 
                      topic: str, 
                      difficulty: Difficulty, 
                      context: str = None) -> Exercise:
        """Generate a new Python exercise"""
        try:
            # Check if we have a similar exercise in storage
            existing_exercises = await self.storage_manager.get_exercises_by_topic(topic)
            for exercise in existing_exercises:
                if exercise.difficulty == difficulty and exercise.context == context:
                    return exercise

            # Generate new exercise using the model
            exercise_data = await self.model_manager.generate_exercise(
                topic=topic,
                difficulty=difficulty.value,
                context=context
            )

            # Create test cases
            test_cases = [
                TestCase(
                    input=tc["input"],
                    expected_output=tc["expected_output"],
                    explanation=tc["explanation"]
                )
                for tc in exercise_data["test_cases"]
            ]

            # Generate solution template based on the exercise
            solution_template = self._generate_solution_template(exercise_data)

            # Create exercise object
            exercise = Exercise(
                id=str(uuid.uuid4()),
                topic=topic,
                difficulty=difficulty,
                question=exercise_data["question"],
                hints=exercise_data["hints"],
                test_cases=test_cases,
                context=context,
                created_at=datetime.now(),
                solution_template=solution_template,
                tags=self._generate_tags(topic, difficulty, exercise_data)
            )

            # Save to storage
            await self.storage_manager.save_exercise(exercise)
            return exercise

        except Exception as e:
            raise Exception(f"Failed to generate exercise: {str(e)}")

    def _generate_solution_template(self, exercise_data: Dict[str, Any]) -> str:
        """Generate a solution template based on the exercise"""
        # Extract function name or main variables from test cases
        test_case = exercise_data["test_cases"][0]
        input_line = test_case["input"]
        
        if "=" in input_line:
            # Variable assignment exercise
            var_name = input_line.split("=")[0].strip()
            return f"# Initialize your {var_name} variable here\n\n# Your code here\n"
        else:
            # Function definition exercise
            return f"""def solution():
    # Your code here
    pass

# Example usage:
{test_case["input"]}
"""

    def _generate_tags(self, topic: str, difficulty: Difficulty, exercise_data: Dict[str, Any]) -> List[str]:
        """Generate relevant tags for the exercise"""
        tags = [topic, difficulty.value]
        
        # Add concept-based tags
        if "concept" in exercise_data:
            tags.extend(exercise_data["concept"].split(" and "))
        
        # Add additional tags based on the question content
        if "loops" in exercise_data["question"].lower():
            tags.append("loops")
        if "function" in exercise_data["question"].lower():
            tags.append("functions")
        if "class" in exercise_data["question"].lower():
            tags.append("classes")
        if "error" in exercise_data["question"].lower():
            tags.append("error-handling")
            
        return list(set(tags))  # Remove duplicates

    async def validate_solution(self, exercise_id: str, solution: str) -> ValidationResult:
        """Validate a submitted solution"""
        try:
            # Get exercise from storage
            exercise = await self.storage_manager.get_exercise(exercise_id)
            if not exercise:
                raise Exception("Exercise not found")

            # Get validation result from model manager
            result = await self.model_manager.validate_solution(exercise_id, solution)
            
            # Create validation result object
            validation_result = ValidationResult(
                is_correct=result["is_correct"],
                feedback=result["feedback"],
                passed_test_cases=result["passed_test_cases"],
                execution_time=result["execution_time"],
                memory_usage=result.get("memory_usage")
            )
            
            return validation_result

        except Exception as e:
            raise Exception(f"Failed to validate solution: {str(e)}")

    async def get_exercise_by_id(self, exercise_id: str) -> Exercise:
        """Get an exercise by its ID"""
        return await self.storage_manager.get_exercise(exercise_id)

    def generate_exercises(self, content: Optional[str] = None, topic: Optional[str] = None,
                difficulty: Optional[str] = None, count: int = 5) -> List[Exercise]:
        """Generate exercises based on content and parameters"""
        exercises = []
        
        # If content is provided, extract relevant parts and determine difficulty
        if content:
            if topic:
                content = self._extract_relevant_content(content, topic)
            if not difficulty:
                difficulty = self._determine_difficulty(content)
        elif not difficulty:
            difficulty = 'basic'  # Default difficulty
            
        # Get templates for the difficulty level
        templates = self.exercise_templates.get(difficulty, self.exercise_templates['basic'])
        
        for _ in range(count):
            # Randomly select a template type
            template_type = random.choice(templates)
            
            if template_type['type'] == 'code_completion':
                task = random.choice(template_type['tasks'])
                if '{n}' in task:
                    task = task.format(n=random.randint(10, 100))
                code_snippet = "# Example starter code\n"
                
            elif template_type['type'] == 'debug':
                bug_example = random.choice(template_type['bugs'])
                buggy_code, _, expected_behavior = bug_example
                
            elif template_type['type'] == 'multiple_choice':
                question = random.choice(template_type['questions'])
                
            elif template_type['type'] == 'implementation':
                task_example = random.choice(template_type['tasks'])
                
            elif template_type['type'] == 'system_design':
                system = random.choice(template_type['systems'])
                
            # Create exercise based on template type
            exercise = Exercise(
                id=str(len(exercises) + 1),
                type=template_type['type'],
                difficulty=difficulty,
                topic=topic or "general",
                content=template_type['template'].format(
                    **locals(),
                    **{'task': task} if 'task' in locals() else {}
                ),
                solution="",  # To be filled by the student
                test_cases=[],  # Can be generated based on exercise type
                hints=["Think about edge cases", "Consider the time complexity"]
            )
            
            exercises.append(exercise)
        
        return exercises

    def validate_solution(self, exercise_id: str, solution: str) -> Dict:
        """Validate a solution for an exercise"""
        # Implementation for solution validation
        pass
