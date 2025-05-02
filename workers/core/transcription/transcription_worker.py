"""
This module contains the transcription worker class.
"""

import logging
from pathlib import Path
from pika.adapters.blocking_connection import BlockingChannel

from core.base_worker import BaseWorker
from core.transcription.transcription_model import (
    TranscriptionJobData,
    TranscriptionResponse,
)
from core.transcription.transcription_service import (
    TranscriptionProvider,
    TranscriptionResult,
    WhisperCppProvider,
)

from settings.config import settings


class AudioTranscriptionWorker(BaseWorker):
    """Worker class for handling audio transcription jobs."""

    def __init__(self) -> None:
        super().__init__("audio_transcription", TranscriptionJobData)

        # Initialize transcription provider
        self.transcription_provider = self._init_transcription_provider()
        self.logger = logging.getLogger(__name__)

    def _init_transcription_provider(self) -> TranscriptionProvider:
        """Initialize the appropriate transcription provider based on settings."""
        # TODO: Add configuration for provider selection
        # For now, using whisper.cpp as default
        return WhisperCppProvider(
            whisper_path=settings.WHISPER_PATH,
            model_path=settings.WHISPER_MODEL_PATH,
            language=settings.WHISPER_LANGUAGE,
            threads=settings.WHISPER_THREADS,
        )

    def process_job(
        self, job_data: TranscriptionJobData, channel: BlockingChannel
    ) -> TranscriptionResult:
        """Process a single job with the given data."""
        try:
            self.logger.info("Processing job for attachment: %s", job_data.attachmentId)

            # Get the audio file path
            audio_path = Path(job_data.audioPath)
            if not audio_path.exists():
                raise FileNotFoundError(f"Audio file not found: {audio_path}")

            # Transcribe the audio
            result = self.transcription_provider.transcribe(audio_path)

            self.logger.info(
                "Successfully transcribed audio for attachment %s. "
                "Duration: %s, Language: %s",
                job_data.attachmentId,
                result.duration,
                result.language,
            )

            response = TranscriptionResponse(
                attachmentId=job_data.attachmentId,
                interviewId=job_data.interviewId,
                audioPath=job_data.audioPath,
                segments=result.segments,
                language=result.language,
                duration=result.duration,
                transcriptionId=job_data.transcriptionId,
            )

            # Convert TranscriptionResult to dict before publishing
            result_dict = response.model_dump()
            # Use base worker's publish_response method
            self.publish_response(channel, "transcription_ready", result_dict)
            return result

        except Exception as e:
            self.logger.error(
                "Error processing job %s: %s", job_data.attachmentId, str(e)
            )
            raise
