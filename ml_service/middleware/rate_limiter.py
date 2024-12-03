from fastapi import HTTPException, Request
from datetime import datetime, timedelta
import time
from typing import Dict, Tuple
import os

class RateLimiter:
    def __init__(self, requests_per_minute: int = 30, ml_requests_per_hour: int = 50):
        self.requests_per_minute = requests_per_minute
        self.ml_requests_per_hour = ml_requests_per_hour
        self.requests: Dict[str, list] = {}
        self.ml_requests: Dict[str, list] = {}
        
    def _cleanup_old_requests(self, requests: list, window: timedelta) -> list:
        current_time = datetime.now()
        return [req_time for req_time in requests if current_time - req_time < window]

    def check_rate_limit(self, request: Request) -> None:
        client_ip = request.client.host
        current_time = datetime.now()
        
        # Initialize if first request
        if client_ip not in self.requests:
            self.requests[client_ip] = []
            self.ml_requests[client_ip] = []
            
        # Cleanup old requests
        self.requests[client_ip] = self._cleanup_old_requests(
            self.requests[client_ip], 
            timedelta(minutes=1)
        )
        
        # Check general rate limit
        if len(self.requests[client_ip]) >= self.requests_per_minute:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please try again in a minute."
            )
            
        # Add current request
        self.requests[client_ip].append(current_time)
        
        # Special handling for ML model endpoints
        if "/generate" in request.url.path or "/analyze" in request.url.path:
            self.ml_requests[client_ip] = self._cleanup_old_requests(
                self.ml_requests[client_ip],
                timedelta(hours=1)
            )
            
            if len(self.ml_requests[client_ip]) >= self.ml_requests_per_hour:
                retry_after = self._get_retry_after(self.ml_requests[client_ip][0])
                raise HTTPException(
                    status_code=429,
                    detail=f"ML model rate limit exceeded. Please try again in {retry_after} minutes."
                )
                
            self.ml_requests[client_ip].append(current_time)
    
    def _get_retry_after(self, oldest_request: datetime) -> int:
        """Calculate minutes until rate limit resets"""
        time_passed = datetime.now() - oldest_request
        minutes_left = 60 - (time_passed.total_seconds() / 60)
        return max(1, round(minutes_left))

    async def __call__(self, request: Request):
        """Middleware entry point"""
        try:
            self.check_rate_limit(request)
        except HTTPException as e:
            # Add retry-after header for 429 responses
            if e.status_code == 429:
                headers = {"Retry-After": str(60)}  # 1 minute for general requests
                if "/generate" in request.url.path or "/analyze" in request.url.path:
                    retry_after = self._get_retry_after(self.ml_requests[request.client.host][0])
                    headers["Retry-After"] = str(retry_after * 60)  # Convert minutes to seconds
                raise HTTPException(
                    status_code=e.status_code,
                    detail=e.detail,
                    headers=headers
                )
