import jwt
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict
from passlib.context import CryptContext
from models.user_schemas import User, UserCreate, UserSession, SessionToken, UserRole, UserPreferences, UserProgress
from .storage_manager import StorageManager
import os
from dotenv import load_dotenv
import logging
import asyncio
from fastapi.encoders import jsonable_encoder

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class AuthService:
    @classmethod
    async def create(cls):
        """Create and initialize an AuthService instance"""
        self = cls()
        await self._initialize_fixed_user()
        return self

    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.storage_manager = StorageManager()
        
        # Use environment variables for sensitive data
        self.secret_key = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 60 * 24 * 7  # 7 days
        
        # Fixed user credentials
        self.FIXED_USERNAME = os.getenv("FIXED_USERNAME", "taanya")
        self.FIXED_PASSWORD_HASH = self.pwd_context.hash(os.getenv("FIXED_PASSWORD", "your-secure-password"))
        self.FIXED_USER_ID = "taanya-001"
        
    async def _initialize_fixed_user(self):
        """Initialize the fixed user account"""
        fixed_user = User(
            id=self.FIXED_USER_ID,
            username=self.FIXED_USERNAME,
            email="taanya@example.com",
            role=UserRole.STUDENT,
            preferences=UserPreferences(),
            progress=UserProgress(),
            password_hash=self.FIXED_PASSWORD_HASH
        )
        await self.storage_manager.save_user(fixed_user)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return self.pwd_context.verify(plain_password, hashed_password)

    async def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """Authenticate user with fixed credentials"""
        if username != self.FIXED_USERNAME:
            return None
            
        user = await self.storage_manager.get_user(self.FIXED_USER_ID)
        if not user:
            return None
            
        if not self.verify_password(password, user.password_hash):
            return None
            
        return user

    def create_access_token(self, user: User) -> SessionToken:
        """Create a new access token for a user"""
        expires_delta = timedelta(minutes=self.access_token_expire_minutes)
        expire = datetime.utcnow() + expires_delta

        # Create session
        session = UserSession(
            session_id=str(uuid.uuid4()),
            user_id=user.id,
            created_at=datetime.utcnow().isoformat(),
            last_active=datetime.utcnow().isoformat(),
            is_active=True
        )

        # Update user's current session
        user.current_session = session
        
        # Create JWT token
        to_encode = {
            "sub": user.username,
            "user_id": user.id,
            "role": user.role,
            "session_id": session.session_id,
            "exp": expire
        }
        
        access_token = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        
        return SessionToken(
            access_token=access_token,
            user_id=user.id,
            username=user.username,
            role=user.role,
            expires_at=expire.isoformat()
        )

    async def get_current_user(self, token: str) -> Optional[User]:
        """Get current user from token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            username: str = payload.get("sub")
            if username != self.FIXED_USERNAME:
                return None
            
            user = await self.storage_manager.get_user(self.FIXED_USER_ID)
            if not user:
                return None
                
            # Verify session is still active
            if not user.current_session or user.current_session.session_id != payload.get("session_id"):
                return None
                
            # Update last active
            user.current_session.last_active = datetime.utcnow().isoformat()
            await self.storage_manager.save_user(user)
            
            return user
        except jwt.JWTError:
            return None

    async def logout_user(self, user: User) -> bool:
        """Logout user by invalidating current session"""
        if user.current_session:
            user.current_session.is_active = False
            user.current_session = None
            await self.storage_manager.save_user(user)
            return True
        return False

    async def update_session_activity(self, user: User) -> None:
        """Update user's session last active timestamp"""
        if user.current_session:
            user.current_session.last_active = datetime.utcnow().isoformat()
            await self.storage_manager.save_user(user)

    def is_session_expired(self, session: UserSession) -> bool:
        """Check if a session has expired"""
        if not session.is_active:
            return True
        
        expiry_time = datetime.fromisoformat(session.last_active) + timedelta(minutes=self.access_token_expire_minutes)
        return datetime.utcnow() > expiry_time
