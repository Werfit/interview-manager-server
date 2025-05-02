"""
This module contains the worker for generating embeddings from transcription segments.
"""

from typing import List
import logging
from pika.adapters.blocking_connection import BlockingChannel

from core.base_worker import BaseWorker
from core.transcription.transcription_model import (
    TranscriptionSegment,
)
from core.embedding.embedding_service import EmbeddingService
from core.embedding.embedding_model import EmbeddingJobData, VectorData, VectorMetadata
from core.embedding.chroma_service import ChromaService


class EmbeddingWorker(BaseWorker):
    """Worker for generating embeddings from transcription segments."""

    def __init__(self) -> None:
        """Initialize the worker with the embedding service."""
        super().__init__("transcription_embedding", EmbeddingJobData)
        self.embedding_service = EmbeddingService()
        self.chroma_service = ChromaService()
        self.logger = logging.getLogger(__name__)

    def _prepare_vector_data(
        self,
        segments: List[TranscriptionSegment],
        embeddings: List[List[float]],
        job_data: EmbeddingJobData,
    ) -> List[VectorData]:
        """Prepare data for vector database storage."""
        vector_data = []
        for segment, embedding in zip(segments, embeddings):
            vector_data.append(
                VectorData(
                    text=segment.text,
                    embedding=embedding,
                    metadata=VectorMetadata(
                        start_time=segment.timestamp.start,
                        end_time=segment.timestamp.end,
                        interview_id=job_data.interviewId,
                        recording_id=job_data.recordingId,
                    ),
                )
            )
        return vector_data

    def process_job(self, job_data: EmbeddingJobData, channel: BlockingChannel) -> bool:
        """Process a transcription job and generate embeddings for its segments."""
        try:
            # Get segments
            segments = job_data.segments

            # Generate embeddings using the embedding service
            embeddings = self.embedding_service.embed_text(segments)

            # Prepare data for vector database
            vector_data = self._prepare_vector_data(segments, embeddings, job_data)

            # Store vectors in ChromaDB
            self.chroma_service.store_vectors(vector_data)

            self.logger.info(
                "Successfully generated and stored embeddings for %d segments",
                len(segments),
            )

            return True

        except Exception as e:
            self.logger.error("Error processing job: %s", str(e))
            raise
