import os
import shutil
from typing import List, Dict, Optional
from fastapi import UploadFile
import PyPDF2
from pathlib import Path
import json
import nltk
from nltk.tokenize import sent_tokenize
from datetime import datetime

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

class PDFManager:
    def __init__(self):
        self.base_path = Path("ml_service/data/learning_materials")
        self.metadata_file = self.base_path / "metadata.json"
        # Create directories if they don't exist
        os.makedirs(self.base_path, exist_ok=True)
        self._load_metadata()

    def _load_metadata(self):
        """Load or create metadata file"""
        if self.metadata_file.exists():
            with open(self.metadata_file, 'r') as f:
                self.metadata = json.load(f)
        else:
            self.metadata = {
                "pdfs": {},
                "last_updated": None
            }
            self._save_metadata()

    def _save_metadata(self):
        """Save metadata to file"""
        self.metadata["last_updated"] = datetime.now().isoformat()
        with open(self.metadata_file, 'w') as f:
            json.dump(self.metadata, f, indent=4)

    def _extract_text_from_pdf(self, file_path: Path) -> str:
        """Extract text content from PDF"""
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text

    def _analyze_content(self, text: str) -> Dict:
        """Analyze PDF content to determine difficulty and topics"""
        # Simple heuristic for difficulty based on keywords
        basic_keywords = {'print', 'variable', 'if', 'for', 'while', 'list', 'string', 'int', 'float'}
        intermediate_keywords = {'function', 'class', 'object', 'method', 'dictionary', 'tuple', 'set'}
        advanced_keywords = {'decorator', 'generator', 'metaclass', 'async', 'await', 'context manager'}

        text_lower = text.lower()
        
        # Count keyword occurrences
        basic_count = sum(1 for word in basic_keywords if word in text_lower)
        intermediate_count = sum(1 for word in intermediate_keywords if word in text_lower)
        advanced_count = sum(1 for word in advanced_keywords if word in text_lower)

        # Determine difficulty
        total = basic_count + intermediate_count + advanced_count
        if total == 0:
            difficulty = "basic"
        else:
            percentages = {
                "basic": basic_count / total,
                "intermediate": intermediate_count / total,
                "advanced": advanced_count / total
            }
            difficulty = max(percentages, key=percentages.get)

        # Extract potential topics
        sentences = sent_tokenize(text)
        topics = []
        current_topic = ""
        for sentence in sentences[:50]:  # Look at first 50 sentences for topics
            sentence_lower = sentence.lower()
            if any(keyword in sentence_lower for keyword in {'chapter', 'section', 'topic', 'part'}):
                current_topic = sentence.strip()
                topics.append(current_topic)

        return {
            "difficulty": difficulty,
            "topics": topics[:5],  # Keep top 5 topics
            "content_length": len(text)
        }

    async def save_pdf(self, file: UploadFile, difficulty: str = None) -> Dict:
        """Save uploaded PDF and process its content"""
        # Ensure directory exists
        if difficulty not in ['basic', 'intermediate', 'advanced']:
            # Auto-detect difficulty if not specified
            temp_path = self.base_path / "temp.pdf"
            with open(temp_path, 'wb') as f:
                content = await file.read()
                f.write(content)
            
            text = self._extract_text_from_pdf(temp_path)
            analysis = self._analyze_content(text)
            difficulty = analysis['difficulty']
            os.remove(temp_path)
            await file.seek(0)

        save_dir = self.base_path / difficulty
        save_dir.mkdir(exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        file_path = save_dir / filename

        # Save file
        with open(file_path, 'wb') as f:
            content = await file.read()
            f.write(content)

        # Process PDF content
        text = self._extract_text_from_pdf(file_path)
        analysis = self._analyze_content(text)

        # Update metadata
        self.metadata["pdfs"][str(file_path)] = {
            "original_name": file.filename,
            "upload_date": datetime.now().isoformat(),
            "difficulty": difficulty,
            "topics": analysis["topics"],
            "content_length": analysis["content_length"]
        }
        self._save_metadata()

        return {
            "filename": filename,
            "path": str(file_path),
            "difficulty": difficulty,
            "topics": analysis["topics"]
        }

    def get_all_pdfs(self) -> Dict:
        """Get information about all stored PDFs"""
        return self.metadata["pdfs"]

    def get_pdf_content(self, pdf_path: str) -> Optional[str]:
        """Get text content of a specific PDF"""
        if not os.path.exists(pdf_path):
            return None
        return self._extract_text_from_pdf(Path(pdf_path))

    def delete_pdf(self, pdf_path: str) -> bool:
        """Delete a PDF and its metadata"""
        if pdf_path in self.metadata["pdfs"]:
            if os.path.exists(pdf_path):
                os.remove(pdf_path)
            del self.metadata["pdfs"][pdf_path]
            self._save_metadata()
            return True
        return False
