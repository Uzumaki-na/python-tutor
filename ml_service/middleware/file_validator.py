from fastapi import Request, HTTPException, UploadFile
from fastapi.responses import JSONResponse
import os
from typing import Set, Dict

class FileValidator:
    def __init__(
        self,
        max_file_size: int = 10 * 1024 * 1024,  # 10MB default
        allowed_extensions: Set[str] = {".pdf"},
        max_files_per_request: int = 5
    ):
        self.max_file_size = max_file_size
        self.allowed_extensions = allowed_extensions
        self.max_files_per_request = max_files_per_request

    async def validate_file(self, file: UploadFile) -> Dict[str, str]:
        """Validate a single file"""
        # Check file size
        file.file.seek(0, os.SEEK_END)
        size = file.file.tell()
        file.file.seek(0)  # Reset file pointer

        if size > self.max_file_size:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {self.max_file_size/1024/1024:.1f}MB"
            )

        # Check file extension
        _, ext = os.path.splitext(file.filename.lower())
        if ext not in self.allowed_extensions:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported file type: {ext}. Allowed types: {', '.join(self.allowed_extensions)}"
            )

        return {
            "filename": file.filename,
            "content_type": "application/pdf" if ext == ".pdf" else "application/octet-stream",
            "size": size
        }

    async def __call__(self, request: Request, call_next):
        if request.method == "POST" and "multipart/form-data" in request.headers.get("content-type", ""):
            form = await request.form()
            files = [f for f in form.values() if isinstance(f, UploadFile)]
            
            # Check number of files
            if len(files) > self.max_files_per_request:
                return JSONResponse(
                    status_code=400,
                    content={
                        "detail": f"Too many files. Maximum is {self.max_files_per_request} files per request"
                    }
                )
            
            # Validate each file
            try:
                for file in files:
                    await self.validate_file(file)
            except HTTPException as e:
                return JSONResponse(
                    status_code=e.status_code,
                    content={"detail": str(e.detail)}
                )

        response = await call_next(request)
        return response
