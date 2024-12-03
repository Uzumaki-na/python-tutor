import pytest
from fastapi.testclient import TestClient
import json
from pathlib import Path

def test_generate_exercise_success(test_client: TestClient, auth_headers, test_data_dir):
    """Test successful exercise generation"""
    response = test_client.post(
        "/exercises/generate",
        headers=auth_headers,
        json={
            "topic": "python functions",
            "difficulty": "intermediate",
            "exercise_type": "implementation"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "prompt" in data
    assert "difficulty" in data
    assert "exercise_type" in data
    assert data["topic"] == "python functions"

def test_generate_exercise_invalid_difficulty(test_client: TestClient, auth_headers):
    """Test exercise generation with invalid difficulty"""
    response = test_client.post(
        "/exercises/generate",
        headers=auth_headers,
        json={
            "topic": "python functions",
            "difficulty": "invalid",
            "exercise_type": "implementation"
        }
    )
    assert response.status_code == 422

def test_generate_exercise_invalid_type(test_client: TestClient, auth_headers):
    """Test exercise generation with invalid exercise type"""
    response = test_client.post(
        "/exercises/generate",
        headers=auth_headers,
        json={
            "topic": "python functions",
            "difficulty": "intermediate",
            "exercise_type": "invalid"
        }
    )
    assert response.status_code == 422

def test_submit_exercise_solution_success(test_client: TestClient, auth_headers, test_data_dir):
    """Test successful exercise solution submission"""
    # First generate an exercise
    gen_response = test_client.post(
        "/exercises/generate",
        headers=auth_headers,
        json={
            "topic": "python functions",
            "difficulty": "intermediate",
            "exercise_type": "implementation"
        }
    )
    exercise_id = gen_response.json()["id"]
    
    # Submit solution
    response = test_client.post(
        f"/exercises/{exercise_id}/submit",
        headers=auth_headers,
        json={
            "solution": "def example_function():\n    return True"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "is_correct" in data
    assert "feedback" in data

def test_submit_exercise_invalid_id(test_client: TestClient, auth_headers):
    """Test submitting solution for non-existent exercise"""
    response = test_client.post(
        "/exercises/invalid_id/submit",
        headers=auth_headers,
        json={
            "solution": "def example_function():\n    return True"
        }
    )
    assert response.status_code == 404

def test_get_exercise_list(test_client: TestClient, auth_headers, test_data_dir):
    """Test getting list of exercises"""
    # Generate a few exercises first
    for _ in range(3):
        test_client.post(
            "/exercises/generate",
            headers=auth_headers,
            json={
                "topic": "python functions",
                "difficulty": "intermediate",
                "exercise_type": "implementation"
            }
        )
    
    response = test_client.get(
        "/exercises",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3
    for exercise in data:
        assert "id" in exercise
        assert "topic" in exercise
        assert "difficulty" in exercise
        assert "exercise_type" in exercise

def test_get_exercise_by_id(test_client: TestClient, auth_headers, test_data_dir):
    """Test getting specific exercise by ID"""
    # Generate an exercise
    gen_response = test_client.post(
        "/exercises/generate",
        headers=auth_headers,
        json={
            "topic": "python functions",
            "difficulty": "intermediate",
            "exercise_type": "implementation"
        }
    )
    exercise_id = gen_response.json()["id"]
    
    response = test_client.get(
        f"/exercises/{exercise_id}",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == exercise_id
    assert "prompt" in data
    assert "difficulty" in data
    assert "exercise_type" in data

def test_filter_exercises(test_client: TestClient, auth_headers, test_data_dir):
    """Test filtering exercises by difficulty and type"""
    # Generate exercises with different difficulties and types
    difficulties = ["beginner", "intermediate", "advanced"]
    types = ["implementation", "debugging", "multiple_choice"]
    
    for diff in difficulties:
        for ex_type in types:
            test_client.post(
                "/exercises/generate",
                headers=auth_headers,
                json={
                    "topic": "python",
                    "difficulty": diff,
                    "exercise_type": ex_type
                }
            )
    
    # Test filtering by difficulty
    response = test_client.get(
        "/exercises?difficulty=intermediate",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert all(ex["difficulty"] == "intermediate" for ex in data)
    
    # Test filtering by type
    response = test_client.get(
        "/exercises?exercise_type=debugging",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert all(ex["exercise_type"] == "debugging" for ex in data)
    
    # Test combined filters
    response = test_client.get(
        "/exercises?difficulty=advanced&exercise_type=implementation",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert all(
        ex["difficulty"] == "advanced" and ex["exercise_type"] == "implementation"
        for ex in data
    )
