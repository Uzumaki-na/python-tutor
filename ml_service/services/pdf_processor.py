import PyPDF2
from fastapi import UploadFile
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
from typing import List, Dict
import json
import os

from models.schemas import PDFContent, Topic, Subtopic

class PDFProcessor:
    def __init__(self):
        # Download required NLTK data
        nltk.download('punkt')
        nltk.download('stopwords')
        nltk.download('averaged_perceptron_tagger')
        
        self.stop_words = set(stopwords.words('english'))
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.processed_content = {}

    async def process_pdf(self, file: UploadFile) -> PDFContent:
        """Process a PDF file and extract structured content"""
        try:
            # Read PDF content
            pdf_reader = PyPDF2.PdfReader(await file.read())
            text_content = ""
            
            # Extract text from all pages
            for page in pdf_reader.pages:
                text_content += page.extract_text()

            # Process the content
            processed_content = self._process_content(text_content)
            
            # Store processed content
            self.processed_content[file.filename] = processed_content
            
            return processed_content

        except Exception as e:
            raise Exception(f"Error processing PDF: {str(e)}")

    def _process_content(self, text: str) -> PDFContent:
        """Process raw text content into structured format"""
        # Tokenize text
        sentences = sent_tokenize(text)
        
        # Extract topics and concepts
        topics = self._extract_topics(sentences)
        concepts = self._extract_concepts(sentences)
        examples = self._extract_examples(sentences)
        
        return PDFContent(
            raw_text=text,
            topics=topics,
            concepts=concepts,
            examples=examples
        )

    def _extract_topics(self, sentences: List[str]) -> List[Topic]:
        """Extract main topics and subtopics from content"""
        topics = []
        current_topic = None
        current_subtopics = []

        for sentence in sentences:
            # Simple heuristic for topic detection
            if sentence.strip().isupper() or sentence.endswith(':'):
                if current_topic and current_subtopics:
                    topics.append(Topic(
                        name=current_topic,
                        description="",  # Can be enhanced with NLP
                        subtopics=current_subtopics,
                        difficulty=self._determine_difficulty(current_topic, current_subtopics)
                    ))
                current_topic = sentence.strip().rstrip(':')
                current_subtopics = []
            elif current_topic and sentence.strip():
                current_subtopics.append(Subtopic(
                    name=sentence.strip(),
                    description="",  # Can be enhanced with NLP
                    concepts=self._extract_concepts_from_sentence(sentence),
                    exercise_count=2  # Default value, can be adjusted
                ))

        # Add the last topic
        if current_topic and current_subtopics:
            topics.append(Topic(
                name=current_topic,
                description="",
                subtopics=current_subtopics,
                difficulty=self._determine_difficulty(current_topic, current_subtopics)
            ))

        return topics

    def _extract_concepts(self, sentences: List[str]) -> List[str]:
        """Extract key concepts from content"""
        concepts = []
        for sentence in sentences:
            # Use POS tagging to identify technical terms
            words = word_tokenize(sentence)
            tagged = nltk.pos_tag(words)
            
            # Look for noun phrases and technical terms
            for word, tag in tagged:
                if (tag.startswith('NN') and  # Nouns
                    word.lower() not in self.stop_words and
                    len(word) > 2):
                    concepts.append(word)

        return list(set(concepts))  # Remove duplicates

    def _extract_examples(self, sentences: List[str]) -> List[dict]:
        """Extract code examples and their explanations"""
        examples = []
        in_example = False
        current_example = {"code": "", "explanation": ""}

        for sentence in sentences:
            if "example:" in sentence.lower() or ">>>" in sentence:
                in_example = True
                current_example = {"code": "", "explanation": ""}
            elif in_example:
                if any(keyword in sentence.lower() for keyword in ["output:", "result:", "returns:"]):
                    current_example["explanation"] = sentence
                    examples.append(current_example)
                    in_example = False
                else:
                    current_example["code"] += sentence + "\n"

        return examples

    def _determine_difficulty(self, topic: str, subtopics: List[Subtopic]) -> str:
        """Determine topic difficulty based on content analysis"""
        # Simple heuristic based on keywords
        advanced_keywords = {"advanced", "complex", "optimization", "architecture"}
        intermediate_keywords = {"intermediate", "functions", "classes", "objects"}
        
        topic_words = set(topic.lower().split())
        for subtopic in subtopics:
            topic_words.update(subtopic.name.lower().split())
        
        if any(keyword in topic_words for keyword in advanced_keywords):
            return "advanced"
        elif any(keyword in topic_words for keyword in intermediate_keywords):
            return "intermediate"
        return "beginner"

    def get_topics(self) -> List[Topic]:
        """Get all processed topics"""
        all_topics = []
        for content in self.processed_content.values():
            all_topics.extend(content.topics)
        return all_topics

    def _extract_concepts_from_sentence(self, sentence: str) -> List[str]:
        """Extract concepts from a single sentence"""
        words = word_tokenize(sentence)
        tagged = nltk.pos_tag(words)
        concepts = []
        
        for word, tag in tagged:
            if (tag.startswith('NN') and  # Nouns
                word.lower() not in self.stop_words and
                len(word) > 2):
                concepts.append(word)
                
        return list(set(concepts))  # Remove duplicates
