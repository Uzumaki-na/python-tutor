import pytest
import sys
import os
from pathlib import Path

def main():
    """Run the test suite with proper configuration"""
    # Add project root to Python path
    project_root = Path(__file__).parent
    sys.path.append(str(project_root))
    
    # Set test environment variables
    os.environ.update({
        "TESTING": "true",
        "JWT_SECRET_KEY": "test_secret_key",
        "FIXED_USERNAME": "test_user",
        "FIXED_PASSWORD": "test_password",
        "FRONTEND_URL": "http://localhost:5173",
        "ACCESS_TOKEN_EXPIRE_MINUTES": "30",
        "ALLOWED_ORIGINS": "http://localhost:5173",
        "MAX_UPLOAD_SIZE": "10485760",
        "MAX_FILES_PER_REQUEST": "5",
        "RATE_LIMIT_PER_MINUTE": "60",
        "DEBUG": "true"
    })
    
    # Run pytest with coverage
    pytest.main([
        "tests",
        "-v",
        "--cov=.",
        "--cov-report=term-missing",
        "--cov-report=html:coverage_report"
    ])

if __name__ == "__main__":
    main()
