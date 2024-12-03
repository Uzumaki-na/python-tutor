from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
import os
from dotenv import load_dotenv
from typing import Optional, List
from datetime import datetime
from models.schemas import Exercise, Topic, Difficulty, ExerciseProgress, User, SessionToken
from services.model_manager import ModelManager
from services.storage_manager import StorageManager
from services.auth_service import AuthService
from services.pdf_manager import PDFManager
from services.exercise_generator import ExerciseGenerator
from auth.auth_middleware import get_current_user
from middleware.rate_limiter import RateLimiter
from middleware.file_validator import FileValidator
from routes import exercises, pdfs, preferences

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Taanya's Python Learning Platform",
    description="An AI-powered platform for learning Python programming",
    version="1.0.0"
)

# CORS configuration
origins = [os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
model_manager = ModelManager()
storage_manager = StorageManager()
auth_service = None
pdf_manager = PDFManager()
exercise_generator = ExerciseGenerator(model_manager)

# Initialize middleware
rate_limiter = RateLimiter(requests_per_minute=int(os.getenv("RATE_LIMIT_PER_MINUTE", "60")))
file_validator = FileValidator(
    max_file_size=int(os.getenv("MAX_UPLOAD_SIZE", str(10 * 1024 * 1024))),
    allowed_extensions={".pdf"},
    max_files_per_request=int(os.getenv("MAX_FILES_PER_REQUEST", "5"))
)

# Add custom middleware
app.middleware("http")(rate_limiter)
app.middleware("http")(file_validator)

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global auth_service
    auth_service = await AuthService.create()
    rate_limiter.start_cleanup()

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown"""
    rate_limiter.stop_cleanup()

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Include routers
app.include_router(exercises.router)
app.include_router(pdfs.router)
app.include_router(preferences.router)

# Auth routes
@app.post("/auth/login", response_model=SessionToken)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await auth_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth_service.create_session_token(user)

@app.post("/auth/logout")
async def logout(current_user: User = Depends(get_current_user)):
    success = await auth_service.logout_user(current_user)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Logout failed"
        )
    return {"message": "Successfully logged out"}

# PDF Management Routes
@app.post("/pdf/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    difficulty: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Upload a PDF learning material"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    # Check file size
    max_size = int(os.getenv("MAX_UPLOAD_SIZE", 10485760))  # Default 10MB
    file_size = 0
    content = await file.read()
    file_size = len(content)
    await file.seek(0)
    
    if file_size > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum allowed size ({max_size/1048576:.1f}MB)"
        )
    
    try:
        result = await pdf_manager.save_pdf(file, difficulty)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/pdf/list")
async def list_pdfs(current_user: User = Depends(get_current_user)):
    """List all available PDFs"""
    return pdf_manager.get_all_pdfs()

@app.delete("/pdf/{pdf_path:path}")
async def delete_pdf(
    pdf_path: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a PDF"""
    success = pdf_manager.delete_pdf(pdf_path)
    if not success:
        raise HTTPException(status_code=404, detail="PDF not found")
    return {"message": "PDF deleted successfully"}

# Exercise Routes
@app.post("/exercises/generate")
async def generate_exercises(
    pdf_path: Optional[str] = None,
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    count: int = 5,
    current_user: User = Depends(get_current_user)
):
    """Generate exercises based on PDF content or topic"""
    content = None
    if pdf_path:
        content = pdf_manager.get_pdf_content(pdf_path)
        if not content:
            raise HTTPException(status_code=404, detail="PDF not found")

    try:
        exercises = exercise_generator.generate_exercises(
            content=content,
            topic=topic,
            difficulty=difficulty,
            count=count
        )
        
        # Save generated exercises
        for exercise in exercises:
            await storage_manager.save_exercise(exercise)
            
        return exercises
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/exercises")
async def get_exercises(
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    completed: Optional[bool] = None,
    current_user: User = Depends(get_current_user)
):
    """Get all exercises with optional filters"""
    try:
        exercises = await storage_manager.get_exercises(
            topic=topic,
            difficulty=difficulty,
            completed=completed,
            user_id=current_user.id
        )
        return exercises
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/exercises/{exercise_id}/submit")
async def submit_solution(
    exercise_id: str,
    solution: str,
    current_user: User = Depends(get_current_user)
):
    """Submit a solution for an exercise"""
    try:
        result = await exercise_generator.validate_solution(exercise_id, solution)
        
        # Update progress
        progress = ExerciseProgress(
            exercise_id=exercise_id,
            user_id=current_user.id,
            completed=result["correct"],
            solution=solution,
            feedback=result.get("feedback", "")
        )
        await storage_manager.save_progress(progress)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Welcome to Taanya's Python Learning API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=bool(os.getenv("DEBUG", "false").lower() == "true")
    )
