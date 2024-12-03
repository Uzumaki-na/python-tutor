from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Optional
import os
from datetime import datetime
from services.pdf_processor import PDFProcessor

router = APIRouter()
pdf_processor = PDFProcessor()

UPLOAD_DIR = "uploads/pdfs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/pdf/upload")
async def upload_pdf(file: UploadFile = File(...), difficulty: Optional[str] = None):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    try:
        # Save the file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        with open(filepath, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Process the PDF
        metadata = await pdf_processor.process_pdf(filepath)
        
        return {
            "filename": filename,
            "path": filepath,
            "difficulty": difficulty or metadata.get("difficulty", "medium"),
            "topics": metadata.get("topics", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pdf/list")
async def list_pdfs():
    try:
        pdfs: Dict[str, dict] = {}
        for filename in os.listdir(UPLOAD_DIR):
            if filename.endswith('.pdf'):
                filepath = os.path.join(UPLOAD_DIR, filename)
                metadata = await pdf_processor.get_metadata(filepath)
                pdfs[filepath] = {
                    "original_name": filename,
                    "upload_date": datetime.fromtimestamp(os.path.getctime(filepath)).isoformat(),
                    **metadata
                }
        return pdfs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/pdf/{filename}")
async def delete_pdf(filename: str):
    try:
        filepath = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(filepath):
            os.remove(filepath)
            return {"message": "PDF deleted successfully"}
        raise HTTPException(status_code=404, detail="PDF not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
