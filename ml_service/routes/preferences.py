from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class UserPreferences(BaseModel):
    theme: str = 'dark'
    sidebarOpen: bool = True
    codeFont: str = 'JetBrains Mono'
    fontSize: int = 14
    autoComplete: bool = True
    notifications: bool = True

# In-memory storage for preferences (replace with database in production)
user_preferences = {}

@router.get("/preferences")
async def get_preferences():
    # In a real app, you would get this from a database based on the user's ID
    return user_preferences.get("default", UserPreferences().dict())

@router.post("/preferences/update")
async def update_preferences(preferences: UserPreferences):
    if preferences.theme not in ['dark', 'light']:
        raise HTTPException(status_code=400, detail="Invalid theme")
    
    if preferences.fontSize < 8 or preferences.fontSize > 32:
        raise HTTPException(status_code=400, detail="Font size must be between 8 and 32")
    
    # In a real app, you would save this to a database with the user's ID
    user_preferences["default"] = preferences.dict()
    return user_preferences["default"]
