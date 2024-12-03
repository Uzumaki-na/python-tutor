from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class Difficulty(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class ExerciseType(str, Enum):
    CODE_COMPLETION = "code_completion"
    DEBUG = "debug"
    MULTIPLE_CHOICE = "multiple_choice"
    IMPLEMENTATION = "implementation"
    CODE_ANALYSIS = "code_analysis"
    SYSTEM_DESIGN = "system_design"
    OPTIMIZATION = "optimization"

class TestCase(BaseModel):
    input: str
    expected_output: str
    explanation: str
    is_hidden: bool = False
    timeout_seconds: float = 2.0

class Exercise(BaseModel):
    id: str
    topic: str
    difficulty: Difficulty
    exercise_type: ExerciseType
    question: str
    hints: List[str]
    test_cases: List[TestCase]
    context: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    solution_template: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    points: int = 10
    time_limit_seconds: float = 5.0

class ExerciseProgress(BaseModel):
    exercise_id: str
    user_id: str
    completed: bool
    solution: str
    feedback: str
    attempts: int = 1
    completed_at: Optional[datetime] = None
    time_spent_seconds: float = 0
    points_earned: int = 0
    test_results: List[bool] = Field(default_factory=list)

class User(BaseModel):
    id: str
    username: str
    email: Optional[EmailStr] = None
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.now)
    last_login: Optional[datetime] = None
    preferences: Dict[str, Any] = Field(default_factory=dict)
    current_level: Difficulty = Difficulty.BEGINNER
    total_points: int = 0
    exercises_completed: int = 0

class SessionToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_at: datetime = Field(default_factory=datetime.now)

    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }

class Subtopic(BaseModel):
    name: str
    description: str
    concepts: List[str]
    exercise_count: int
    prerequisites: List[str] = Field(default_factory=list)
    learning_objectives: List[str] = Field(default_factory=list)

class Topic(BaseModel):
    name: str
    description: str
    subtopics: List[Subtopic]
    difficulty: Difficulty
    estimated_hours: float
    prerequisites: List[str] = Field(default_factory=list)

class PDFContent(BaseModel):
    file_path: str
    raw_text: str
    topics: List[Topic]
    concepts: List[str]
    examples: List[Dict[str, Any]]
    difficulty: Difficulty
    metadata: Dict[str, Any] = Field(default_factory=dict)
    extracted_at: datetime = Field(default_factory=datetime.now)

class ValidationResult(BaseModel):
    is_correct: bool
    feedback: str
    passed_test_cases: List[bool]
    execution_time: float
    memory_usage: Optional[float] = None
    error_message: Optional[str] = None
    suggestions: List[str] = Field(default_factory=list)

class UserStats(BaseModel):
    user_id: str
    exercises_completed: int = 0
    total_points: int = 0
    average_completion_time: float = 0
    success_rate: float = 0
    topics_mastered: List[str] = Field(default_factory=list)
    current_streak: int = 0
    longest_streak: int = 0
    last_activity: Optional[datetime] = None
