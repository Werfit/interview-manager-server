"""
This module provides a service for embedding text using a pre-trained model.

The EmbeddingService class provides a method for embedding a list of text segments.
The embed_text method takes a list of TranscriptionSegment objects and returns a list of embeddings.
"""

from typing import List
import logging

from sentence_transformers import SentenceTransformer

from core.transcription.transcription_model import TranscriptionSegment


class EmbeddingService:
    """Service for embedding text."""

    def __init__(self):
        self.model = SentenceTransformer(
            "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        )
        self.logger = logging.getLogger(__name__)

    def _generate_embeddings(self, segments: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of text segments."""
        embeddings = self.model.encode(segments, convert_to_numpy=True)
        return embeddings.tolist()

    def embed_text(self, segments: List[TranscriptionSegment]) -> List[float]:
        """Embed a text using the model."""
        segment_texts = [segment.text for segment in segments]

        # Generate embeddings
        embeddings = self._generate_embeddings(segment_texts)

        return embeddings
