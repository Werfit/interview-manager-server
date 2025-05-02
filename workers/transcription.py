"""
This is a worker that listens for video jobs from the queue and processes them.

The worker will:
1) Download video from S3 using job_data info
2) Extract audio
3) Process audio (LLM tasks)
4) Optionally push result back to queue or callback
"""

from core.transcription.transcription_worker import AudioTranscriptionWorker
from helpers import start_worker


def main() -> None:
    """Main entry point for the worker application."""
    start_worker(AudioTranscriptionWorker, "TranscriptionWorker")


if __name__ == "__main__":
    main()
