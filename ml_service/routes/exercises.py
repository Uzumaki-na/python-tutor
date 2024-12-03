from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from models.schemas import Exercise, User
from services.model_manager import ModelManager
from services.storage_manager import StorageManager
from auth.auth_middleware import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

model_manager = ModelManager()
storage_manager = StorageManager()

class Exercise(BaseModel):
    id: str
    question: str
    answer: str
    difficulty: str
    topic: str
    created_at: datetime

class ExerciseCreate(BaseModel):
    pdf_path: Optional[str] = None
    topic: Optional[str] = None
    difficulty: Optional[str] = 'medium'
    count: Optional[int] = 5

@router.get("/exercises", response_model=List[Exercise])
async def get_exercises(
    current_user: User = Depends(get_current_user),
    topic: Optional[str] = None,
    difficulty: Optional[str] = None
):
    """Get exercises filtered by topic and difficulty"""
    try:
        exercises = await storage_manager.get_exercises(
            user_id=current_user.id,
            topic=topic,
            difficulty=difficulty
        )
        return exercises
    except Exception as e:
        logger.error(f"Error fetching exercises: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch exercises"
        )

@router.post("/exercises/generate")
async def generate_exercise(
    params: ExerciseCreate,
    current_user: User = Depends(get_current_user)
):
    """Generate a new exercise"""
    try:
        exercises = await model_manager.generate_exercises(
            pdf_path=params.pdf_path,
            topic=params.topic,
            difficulty=params.difficulty,
            count=params.count
        )
        
        # If we got a fallback exercise, mark it as such
        if exercises.get("is_fallback"):
            logger.warning("Using fallback exercise due to model unavailability")
            return {
                **exercises,
                "message": "Using a pre-generated exercise due to high demand. Please try again later for a custom exercise."
            }
            
        # Store the generated exercise
        exercise_ids = await storage_manager.save_exercises(
            user_id=current_user.id,
            exercises_data=exercises
        )
        
        return {
            **exercises,
            "ids": exercise_ids
        }
        
    except HTTPException as he:
        # Pass through HTTP exceptions (like rate limits)
        raise he
    except Exception as e:
        logger.error(f"Error generating exercise: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate exercise"
        )

@router.post("/exercises/{exercise_id}/submit")
async def submit_exercise(
    exercise_id: str,
    answer: str,
    current_user: User = Depends(get_current_user)
):
    """Validate a solution for an exercise"""
    try:
        # First check if the exercise exists and belongs to the user
        exercise = await storage_manager.get_exercise(exercise_id)
        if not exercise or exercise.get("user_id") != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exercise not found"
            )
            
        result = await model_manager.check_answer(exercise_id, answer)
        
        # If we got a fallback validation
        if result.get("is_fallback"):
            logger.warning("Using basic validation due to model unavailability")
            return {
                **result,
                "message": "Using basic validation due to high demand. Please try again later for detailed feedback."
            }
            
        # Store the validation result
        await storage_manager.save_solution_attempt(
            user_id=current_user.id,
            exercise_id=exercise_id,
            solution=answer,
            result=result
        )
        
        return result
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error validating solution: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to validate solution"
        )
