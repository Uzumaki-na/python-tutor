from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.auth_service import AuthService

class AuthMiddleware(HTTPBearer):
    def __init__(self):
        super().__init__(auto_error=True)
        self.auth_service = AuthService()

    async def __call__(self, request: Request) -> HTTPAuthorizationCredentials:
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)
        
        if not credentials:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")
        
        if not credentials.scheme == "Bearer":
            raise HTTPException(status_code=403, detail="Invalid authentication scheme.")
        
        user = await self.auth_service.get_current_user(credentials.credentials)
        if not user:
            raise HTTPException(status_code=403, detail="Invalid token or expired session.")
        
        # Update session activity
        await self.auth_service.update_session_activity(user)
        
        # Add user to request state
        request.state.user = user
        
        return credentials
