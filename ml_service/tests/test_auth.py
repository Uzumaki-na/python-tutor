import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
import os

def test_login_success(test_client: TestClient):
    """Test successful login"""
    response = test_client.post(
        "/auth/login",
        data={
            "username": os.getenv("FIXED_USERNAME", "taanya"),
            "password": os.getenv("FIXED_PASSWORD", "test_password")
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_login_invalid_credentials(test_client: TestClient):
    """Test login with invalid credentials"""
    response = test_client.post(
        "/auth/login",
        data={
            "username": "invalid_user",
            "password": "invalid_password"
        }
    )
    assert response.status_code == 401
    assert "detail" in response.json()

def test_protected_route_with_token(test_client: TestClient, auth_headers):
    """Test accessing protected route with valid token"""
    response = test_client.get(
        "/exercises",
        headers=auth_headers
    )
    assert response.status_code == 200

def test_protected_route_without_token(test_client: TestClient):
    """Test accessing protected route without token"""
    response = test_client.get("/exercises")
    assert response.status_code == 401

def test_protected_route_invalid_token(test_client: TestClient):
    """Test accessing protected route with invalid token"""
    headers = {"Authorization": "Bearer invalid_token"}
    response = test_client.get(
        "/exercises",
        headers=headers
    )
    assert response.status_code == 401

def test_token_expiration(test_client: TestClient):
    """Test token expiration"""
    from auth.auth_middleware import create_access_token
    
    # Create token that expires in 1 second
    token = create_access_token(
        data={"sub": "test_user"},
        expires_delta=timedelta(seconds=1)
    )
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Wait for token to expire
    import time
    time.sleep(2)
    
    response = test_client.get(
        "/exercises",
        headers=headers
    )
    assert response.status_code == 401
    assert "Token has expired" in response.json()["detail"]
