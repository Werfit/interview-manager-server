"""
This module contains the models for the application.
"""

from typing import List, Optional

from pydantic import BaseModel, Field


class TranscriptionJobData(BaseModel):
    """Model for validating job data received from the queue."""

    audioPath: str = Field(..., description="Path to the audio file")
    attachmentId: str = Field(..., description="Unique identifier for the attachment")
    interviewId: str = Field(..., description="Unique identifier for the interview")
    transcriptionId: str = Field(
        ..., description="Unique identifier for the transcription"
    )


class Timestamp(BaseModel):
    """Model for timestamp information."""

    start: float  # Start time in milliseconds
    end: float  # End time in milliseconds


class TranscriptionSegment(BaseModel):
    """Model for a single transcription segment."""

    timestamp: Timestamp
    text: str


class TranscriptionResult(BaseModel):
    """Model for transcription results."""

    segments: List[TranscriptionSegment]
    language: Optional[str] = None
    duration: Optional[float] = None

    def __str__(self) -> str:
        return "\n".join(
            [
                f"{segment.timestamp.start} - {segment.timestamp.end}: {segment.text}"
                for segment in self.segments
            ]
        )


class TranscriptionResponse(TranscriptionResult):
    """Model for transcription response."""

    attachmentId: str
    interviewId: str
    audioPath: str
    transcriptionId: str
