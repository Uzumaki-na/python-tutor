from pydantic import BaseModel, Field, EmailStr, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class BaseModelWithConfig(BaseModel):
    class Config:
        orm_mode = True
        arbitrary_types_allowed = True

    @validator("*", pre=True)
    def convert_datetime(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v

class UserRole(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"

class UserPreferences(BaseModelWithConfig):
    difficulty_preference: str = "adaptive"  # adaptive, fixed
    topic_focus: Optional[List[str]] = None
    daily_exercise_goal: int = 5
    exercise_reminders: bool = True
    theme: str = "light"
    code_editor_theme: str = "vs-dark"

class UserProgress(BaseModelWithConfig):
    total_exercises_completed: int = 0
    correct_solutions: int = 0
    total_time_spent: float = 0.0  # in minutes
    streak_days: int = 0
    last_active: str = Field(default_factory=lambda: datetime.now().isoformat())
    mastered_topics: List[str] = Field(default_factory=list)
    current_topics: List[str] = Field(default_factory=list)
    difficulty_levels: Dict[str, float] = Field(default_factory=dict)  # topic -> difficulty level mapping

class UserSession(BaseModelWithConfig):
    session_id: str
    user_id: str
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    last_active: str = Field(default_factory=lambda: datetime.now().isoformat())
    is_active: bool = True
    device_info: Optional[Dict[str, str]] = None

class User(BaseModelWithConfig):
    id: str
    username: str
    email: EmailStr
    role: UserRole = UserRole.STUDENT
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    progress: UserProgress = Field(default_factory=UserProgress)
    current_session: Optional[UserSession] = None

class UserCreate(BaseModelWithConfig):
    username: str
    email: EmailStr
    password: str
    role: Optional[UserRole] = UserRole.STUDENT

class UserLogin(BaseModelWithConfig):
    username: str
    password: str

class UserUpdate(BaseModelWithConfig):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    preferences: Optional[UserPreferences] = None

class SessionToken(BaseModelWithConfig):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: str
    role: UserRole
    expires_at: str = Field(default_factory=lambda: datetime.now().isoformat())

class LearningPath(BaseModelWithConfig):
    user_id: str
    current_topic: str
    next_topics: List[str]
    recommended_exercises: List[str]
    difficulty_adjustment: float
    last_updated: str = Field(default_factory=lambda: datetime.now().isoformat())

class UserStats(BaseModelWithConfig):
    user_id: str
    total_exercises: int = 0
    completed_exercises: int = 0
    correct_solutions: int = 0
    average_time_per_exercise: float = 0.0
    topic_proficiency: Dict[str, float] = Field(default_factory=dict)
    recent_activity: List[Dict[str, Any]] = Field(default_factory=list)
    learning_streaks: int = 0
    achievements: List[str] = Field(default_factory=list)
    last_updated: str = Field(default_factory=lambda: datetime.now().isoformat())
