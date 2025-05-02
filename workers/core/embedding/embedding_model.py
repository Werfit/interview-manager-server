"""
This module contains the models for the embedding service.
"""

from typing import List
from pydantic import BaseModel

from core.transcription.transcription_model import TranscriptionSegment


class EmbeddingJobData(BaseModel):
    """Model for embedding job data."""

    interviewId: str
    recordingId: str
    segments: List[TranscriptionSegment]


class VectorMetadata(BaseModel):
    """Model for vector metadata."""

    start_time: float
    end_time: float
    interview_id: str
    recording_id: str


class VectorData(BaseModel):
    """Model for vector data storage."""

    text: str
    embedding: List[float]
    metadata: VectorMetadata
