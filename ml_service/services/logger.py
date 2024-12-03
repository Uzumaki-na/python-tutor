import logging
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional
from fastapi import Request, Response
import traceback
import asyncio
import aiofiles
from logging.handlers import RotatingFileHandler

class AsyncRotatingFileHandler(RotatingFileHandler):
    """Async version of RotatingFileHandler"""
    async def aemit(self, record: logging.LogRecord) -> None:
        try:
            msg = self.format(record)
            async with aiofiles.open(self.baseFilename, 'a', encoding='utf-8') as f:
                await f.write(msg + self.terminator)
        except Exception:
            self.handleError(record)

class Logger:
    def __init__(self, log_dir: str = "logs"):
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(exist_ok=True)

        # Create different log files for different purposes
        self.setup_loggers()

    def setup_loggers(self):
        # API request logger
        self.api_logger = logging.getLogger('api')
        self.api_logger.setLevel(logging.INFO)
        api_handler = AsyncRotatingFileHandler(
            self.log_dir / 'api.log',
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        )
        api_handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s'
        ))
        self.api_logger.addHandler(api_handler)

        # Error logger
        self.error_logger = logging.getLogger('error')
        self.error_logger.setLevel(logging.ERROR)
        error_handler = AsyncRotatingFileHandler(
            self.log_dir / 'error.log',
            maxBytes=10*1024*1024,
            backupCount=5
        )
        error_handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s\n%(pathname)s:%(lineno)d\n%(message)s\n'
        ))
        self.error_logger.addHandler(error_handler)

        # Exercise generation logger
        self.exercise_logger = logging.getLogger('exercise')
        self.exercise_logger.setLevel(logging.INFO)
        exercise_handler = AsyncRotatingFileHandler(
            self.log_dir / 'exercise.log',
            maxBytes=10*1024*1024,
            backupCount=5
        )
        exercise_handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s'
        ))
        self.exercise_logger.addHandler(exercise_handler)

        # Security logger
        self.security_logger = logging.getLogger('security')
        self.security_logger.setLevel(logging.INFO)
        security_handler = AsyncRotatingFileHandler(
            self.log_dir / 'security.log',
            maxBytes=10*1024*1024,
            backupCount=5
        )
        security_handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s'
        ))
        self.security_logger.addHandler(security_handler)

    async def log_request(self, request: Request, response: Response, duration: float):
        """Log API request details"""
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        
        log_data = {
            "timestamp": datetime.now().isoformat(),
            "method": request.method,
            "path": str(request.url),
            "status_code": response.status_code,
            "duration_ms": round(duration * 1000, 2),
            "client_ip": client_ip,
            "user_agent": user_agent
        }
        
        await self._async_log(self.api_logger, "info", json.dumps(log_data))

    async def log_error(self, error: Exception, request: Optional[Request] = None):
        """Log error details"""
        log_data = {
            "timestamp": datetime.now().isoformat(),
            "error_type": type(error).__name__,
            "error_message": str(error),
            "traceback": traceback.format_exc()
        }
        
        if request:
            log_data.update({
                "method": request.method,
                "path": str(request.url),
                "client_ip": request.client.host if request.client else "unknown"
            })
        
        await self._async_log(self.error_logger, "error", json.dumps(log_data))

    async def log_exercise_generation(self, exercise_type: str, difficulty: str, topic: str, success: bool):
        """Log exercise generation details"""
        log_data = {
            "timestamp": datetime.now().isoformat(),
            "exercise_type": exercise_type,
            "difficulty": difficulty,
            "topic": topic,
            "success": success
        }
        
        await self._async_log(self.exercise_logger, "info", json.dumps(log_data))

    async def log_security_event(self, event_type: str, details: Dict[str, Any]):
        """Log security-related events"""
        log_data = {
            "timestamp": datetime.now().isoformat(),
            "event_type": event_type,
            **details
        }
        
        await self._async_log(self.security_logger, "info", json.dumps(log_data))

    @staticmethod
    async def _async_log(logger: logging.Logger, level: str, message: str):
        """Helper method to handle async logging"""
        if hasattr(logger.handlers[0], 'aemit'):
            record = logging.LogRecord(
                logger.name, getattr(logging, level.upper()),
                "", 0, message, (), None
            )
            await logger.handlers[0].aemit(record)
        else:
            getattr(logger, level)(message)

# Create global logger instance
logger = Logger()
