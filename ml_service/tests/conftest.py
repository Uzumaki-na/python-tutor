import pytest
from fastapi.testclient import TestClient
from pathlib import Path
import sys
import os
import shutil
import json
from datetime import datetime, timedelta

# Add project root to Python path
sys.path.append(str(Path(__file__).parent.parent))

from main import app
from services.model_manager import ModelManager
from services.exercise_generator import ExerciseGenerator

@pytest.fixture
def test_client():
    """Create a test client"""
    return TestClient(app)

@pytest.fixture
def test_data_dir(tmp_path):
    """Create a temporary directory for test data"""
    test_dir = tmp_path / "test_data"
    test_dir.mkdir()
    
    # Create subdirectories
    (test_dir / "pdfs").mkdir()
    (test_dir / "exercises").mkdir()
    (test_dir / "progress").mkdir()
    (test_dir / "users").mkdir()
    
    yield test_dir
    
    # Cleanup
    shutil.rmtree(test_dir)

@pytest.fixture
def mock_model_manager():
    """Create a mock model manager"""
    class MockModelManager:
        async def generate_text(self, prompt: str) -> str:
            return "Mock generated text"
        
        async def analyze_text(self, text: str) -> dict:
            return {
                "difficulty": "intermediate",
                "topics": ["python", "programming"],
                "keywords": ["function", "class", "loop"]
            }
    
    return MockModelManager()

@pytest.fixture
def mock_exercise_generator(mock_model_manager):
    """Create a mock exercise generator"""
    return ExerciseGenerator(mock_model_manager)

@pytest.fixture
def test_user_token():
    """Create a test JWT token"""
    from auth.auth_middleware import create_access_token
    
    access_token = create_access_token(
        data={"sub": "test_user"},
        expires_delta=timedelta(minutes=30)
    )
    return access_token

@pytest.fixture
def auth_headers(test_user_token):
    """Create authorization headers"""
    return {"Authorization": f"Bearer {test_user_token}"}
