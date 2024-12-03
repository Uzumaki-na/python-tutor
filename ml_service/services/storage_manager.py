from typing import Dict, List, Optional
import json
import os
from datetime import datetime
from models.schemas import Exercise, ExerciseProgress, User
import aiofiles
import asyncio
from pathlib import Path

class StorageManager:
    def __init__(self):
        self.base_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
        self.exercises_dir = os.path.join(self.base_dir, "exercises")
        self.progress_dir = os.path.join(self.base_dir, "progress")
        self.users_dir = os.path.join(self.base_dir, "users")
        
        # Create directories if they don't exist
        for directory in [self.exercises_dir, self.progress_dir, self.users_dir]:
            os.makedirs(directory, exist_ok=True)

    async def save_exercise(self, exercise: Exercise) -> None:
        """Save an exercise to storage"""
        exercise_path = os.path.join(self.exercises_dir, f"{exercise.id}.json")
        exercise_dict = exercise.dict()
        exercise_dict["created_at"] = exercise_dict["created_at"].isoformat()
        
        async with aiofiles.open(exercise_path, 'w') as f:
            await f.write(json.dumps(exercise_dict, indent=2))

    async def get_exercise(self, exercise_id: str) -> Optional[Exercise]:
        """Get an exercise by ID"""
        exercise_path = os.path.join(self.exercises_dir, f"{exercise_id}.json")
        try:
            async with aiofiles.open(exercise_path, 'r') as f:
                content = await f.read()
                exercise_dict = json.loads(content)
                exercise_dict["created_at"] = datetime.fromisoformat(exercise_dict["created_at"])
                return Exercise(**exercise_dict)
        except FileNotFoundError:
            return None

    async def get_exercises(self, 
                          topic: Optional[str] = None,
                          difficulty: Optional[str] = None,
                          completed: Optional[bool] = None,
                          user_id: Optional[str] = None) -> List[Exercise]:
        """Get exercises with optional filters"""
        exercises = []
        
        # Get all exercise files
        exercise_files = [f for f in os.listdir(self.exercises_dir) if f.endswith('.json')]
        
        for file in exercise_files:
            exercise_path = os.path.join(self.exercises_dir, file)
            async with aiofiles.open(exercise_path, 'r') as f:
                content = await f.read()
                exercise_dict = json.loads(content)
                exercise_dict["created_at"] = datetime.fromisoformat(exercise_dict["created_at"])
                exercise = Exercise(**exercise_dict)
                
                # Apply filters
                if topic and topic.lower() not in [t.lower() for t in exercise.tags]:
                    continue
                    
                if difficulty and exercise.difficulty != difficulty:
                    continue
                    
                if completed is not None and user_id:
                    progress = await self.get_progress(exercise.id, user_id)
                    if completed != bool(progress and progress.completed):
                        continue
                
                exercises.append(exercise)
        
        return exercises

    async def save_progress(self, progress: ExerciseProgress) -> None:
        """Save exercise progress"""
        progress_path = os.path.join(
            self.progress_dir, 
            f"{progress.user_id}_{progress.exercise_id}.json"
        )
        progress_dict = progress.dict()
        
        async with aiofiles.open(progress_path, 'w') as f:
            await f.write(json.dumps(progress_dict, indent=2))

    async def get_progress(self, exercise_id: str, user_id: str) -> Optional[ExerciseProgress]:
        """Get progress for a specific exercise and user"""
        progress_path = os.path.join(
            self.progress_dir,
            f"{user_id}_{exercise_id}.json"
        )
        try:
            async with aiofiles.open(progress_path, 'r') as f:
                content = await f.read()
                return ExerciseProgress(**json.loads(content))
        except FileNotFoundError:
            return None

    async def get_user_progress(self, user_id: str) -> List[ExerciseProgress]:
        """Get all progress for a user"""
        progress_list = []
        progress_files = [
            f for f in os.listdir(self.progress_dir)
            if f.startswith(f"{user_id}_") and f.endswith('.json')
        ]
        
        for file in progress_files:
            progress_path = os.path.join(self.progress_dir, file)
            async with aiofiles.open(progress_path, 'r') as f:
                content = await f.read()
                progress_list.append(ExerciseProgress(**json.loads(content)))
        
        return progress_list

    async def save_user(self, user: User) -> None:
        """Save user data"""
        user_path = os.path.join(self.users_dir, f"{user.id}.json")
        user_dict = user.dict()
        
        async with aiofiles.open(user_path, 'w') as f:
            await f.write(json.dumps(user_dict, indent=2))

    async def get_user(self, user_id: str) -> Optional[User]:
        """Get user data by ID"""
        user_path = os.path.join(self.users_dir, f"{user_id}.json")
        try:
            async with aiofiles.open(user_path, 'r') as f:
                content = await f.read()
                return User(**json.loads(content))
        except FileNotFoundError:
            return None

    async def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user data by username"""
        user_files = [f for f in os.listdir(self.users_dir) if f.endswith('.json')]
        
        for file in user_files:
            user_path = os.path.join(self.users_dir, file)
            async with aiofiles.open(user_path, 'r') as f:
                content = await f.read()
                user = User(**json.loads(content))
                if user.username.lower() == username.lower():
                    return user
        
        return None

    async def delete_exercise(self, exercise_id: str) -> bool:
        """Delete an exercise and its associated progress"""
        exercise_path = os.path.join(self.exercises_dir, f"{exercise_id}.json")
        try:
            os.remove(exercise_path)
            
            # Delete associated progress files
            progress_files = [
                f for f in os.listdir(self.progress_dir)
                if f.endswith(f"_{exercise_id}.json")
            ]
            for file in progress_files:
                os.remove(os.path.join(self.progress_dir, file))
                
            return True
        except FileNotFoundError:
            return False
