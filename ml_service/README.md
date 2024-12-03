# Taanya's Python Learning Platform - Backend Service

An AI-powered Python learning platform that generates personalized exercises and processes learning content.

## Features

- PDF content processing and analysis
- Intelligent exercise generation
- Progress tracking
- Content difficulty detection
- Multiple exercise types:
  - Code completion
  - Debugging
  - Multiple choice
  - Implementation challenges
  - Code analysis
  - System design
  - Optimization problems

## Setup

1. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file with the following variables:
```env
JWT_SECRET_KEY=your-super-secret-key-change-this
FIXED_USERNAME=taanya
FIXED_PASSWORD=your-secure-password-change-this
FRONTEND_URL=http://localhost:5173
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ALLOWED_ORIGINS=http://localhost:5173
MAX_UPLOAD_SIZE=10485760
DEBUG=true
```

4. Start the server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

### Authentication

- POST `/auth/login`: Login with username and password
- POST `/auth/logout`: Logout current user

### PDF Management

- POST `/pdf/upload`: Upload a PDF file
- GET `/pdf/list`: List all uploaded PDFs
- DELETE `/pdf/{pdf_path}`: Delete a PDF

### Exercise Generation

- POST `/exercises/generate`: Generate exercises from PDF or topic
- GET `/exercises`: List exercises with optional filters
- POST `/exercises/{id}/submit`: Submit a solution for an exercise

## Directory Structure

```
ml_service/
├── data/
│   ├── exercises/    # Exercise JSON files
│   ├── progress/     # User progress files
│   ├── users/        # User data files
│   └── pdfs/         # Uploaded PDFs
├── models/           # Pydantic models
├── services/         # Core services
└── middleware/       # FastAPI middleware
```

## Development

1. Run tests:
```bash
pytest
```

2. Format code:
```bash
black .
```

3. Check types:
```bash
mypy .
```

## Security Notes

- This is a single-user system designed for Taanya
- All credentials are stored in environment variables
- File uploads are restricted to PDFs
- Maximum upload size is configurable
- JWT tokens expire after 7 days
