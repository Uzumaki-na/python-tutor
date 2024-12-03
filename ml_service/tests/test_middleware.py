import pytest
from fastapi.testclient import TestClient
import time
from pathlib import Path

def test_rate_limiter(test_client: TestClient, auth_headers):
    """Test rate limiting middleware"""
    # Get rate limit from env or use default
    import os
    rate_limit = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    
    # Make requests up to the limit
    responses = []
    for _ in range(rate_limit):
        response = test_client.get(
            "/exercises",
            headers=auth_headers
        )
        responses.append(response)
    
    # All requests should succeed
    assert all(r.status_code == 200 for r in responses)
    
    # Next request should be rate limited
    response = test_client.get(
        "/exercises",
        headers=auth_headers
    )
    assert response.status_code == 429
    assert "Rate limit exceeded" in response.json()["detail"]
    assert "retry_after" in response.json()
    
    # Wait for rate limit window to reset
    time.sleep(60)
    
    # Should be able to make requests again
    response = test_client.get(
        "/exercises",
        headers=auth_headers
    )
    assert response.status_code == 200

def test_file_validator_size(test_client: TestClient, auth_headers, test_data_dir):
    """Test file size validation"""
    # Create a file larger than the limit
    max_size = int(os.getenv("MAX_UPLOAD_SIZE", "10485760"))  # 10MB default
    large_file = test_data_dir / "large_file.pdf"
    
    with open(large_file, "wb") as f:
        f.write(b"0" * (max_size + 1024))  # Slightly larger than limit
    
    with open(large_file, "rb") as f:
        response = test_client.post(
            "/pdf/upload",
            headers=auth_headers,
            files={"file": ("large_file.pdf", f, "application/pdf")}
        )
    
    assert response.status_code == 413
    assert "File too large" in response.json()["detail"]

def test_file_validator_type(test_client: TestClient, auth_headers, test_data_dir):
    """Test file type validation"""
    # Create a non-PDF file
    invalid_file = test_data_dir / "test.txt"
    with open(invalid_file, "w") as f:
        f.write("This is not a PDF")
    
    with open(invalid_file, "rb") as f:
        response = test_client.post(
            "/pdf/upload",
            headers=auth_headers,
            files={"file": ("test.txt", f, "text/plain")}
        )
    
    assert response.status_code == 415
    assert "Unsupported file type" in response.json()["detail"]

def test_file_validator_multiple_files(test_client: TestClient, auth_headers, test_data_dir):
    """Test multiple file upload validation"""
    max_files = int(os.getenv("MAX_FILES_PER_REQUEST", "5"))
    
    # Create multiple small PDF files
    files = []
    for i in range(max_files + 1):
        file_path = test_data_dir / f"test_{i}.pdf"
        with open(file_path, "wb") as f:
            f.write(b"%PDF-1.4\n%Test PDF")
        files.append(("files", (f"test_{i}.pdf", open(file_path, "rb"), "application/pdf")))
    
    try:
        response = test_client.post(
            "/pdf/upload",
            headers=auth_headers,
            files=files
        )
        
        assert response.status_code == 400
        assert "Too many files" in response.json()["detail"]
    
    finally:
        # Clean up opened files
        for _, (_, f, _) in files:
            f.close()

def test_cors_middleware(test_client: TestClient):
    """Test CORS middleware"""
    allowed_origin = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
    
    # Test allowed origin
    headers = {
        "Origin": allowed_origin,
        "Access-Control-Request-Method": "POST"
    }
    response = test_client.options(
        "/auth/login",
        headers=headers
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == allowed_origin
    
    # Test disallowed origin
    headers = {
        "Origin": "http://evil.com",
        "Access-Control-Request-Method": "POST"
    }
    response = test_client.options(
        "/auth/login",
        headers=headers
    )
    assert response.status_code == 400

def test_concurrent_rate_limiting(test_client: TestClient, auth_headers):
    """Test rate limiting under concurrent requests"""
    import asyncio
    import aiohttp
    
    async def make_request():
        async with aiohttp.ClientSession() as session:
            async with session.get(
                "http://testserver/exercises",
                headers=auth_headers
            ) as response:
                return response.status
    
    # Make multiple concurrent requests
    loop = asyncio.get_event_loop()
    tasks = [make_request() for _ in range(10)]
    status_codes = loop.run_until_complete(asyncio.gather(*tasks))
    
    # Some requests should succeed, others might be rate limited
    assert 200 in status_codes  # At least some successful
    assert all(code in [200, 429] for code in status_codes)  # Only valid status codes
