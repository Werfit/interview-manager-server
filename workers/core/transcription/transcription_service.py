"""
This module contains the transcription service.
"""

from typing import Optional, Protocol
from pathlib import Path
import subprocess


from core.transcription.transcription_model import (
    TranscriptionResult,
    TranscriptionSegment,
    Timestamp,
)


class TranscriptionProvider(Protocol):
    """Protocol defining the interface for transcription providers."""

    def transcribe(self, audio_path: str | Path) -> TranscriptionResult:
        """Transcribe the audio file at the given path."""


class WhisperCppProvider(TranscriptionProvider):
    """Provider for local whisper.cpp transcription."""

    def __init__(
        self,
        whisper_path: str | Path,
        model_path: str | Path,
        language: Optional[str] = None,
        threads: int = 4,
    ) -> None:
        """Initialize the whisper.cpp provider.

        Args:
            whisper_path: Path to the whisper.cpp executable
            model_path: Path to the model file
            language: Optional language code (e.g., 'en', 'es')
            temperature: Sampling temperature (0.0 for deterministic output)
        """
        self.whisper_path = Path(whisper_path)
        self.model_path = Path(model_path)
        self.language = language
        self.threads = threads

        if not self.whisper_path.exists():
            raise FileNotFoundError(
                f"Whisper executable not found: {self.whisper_path}"
            )
        if not self.model_path.exists():
            raise FileNotFoundError(f"Model file not found: {self.model_path}")

    def transcribe(self, audio_path: str | Path) -> TranscriptionResult:
        """Transcribe the audio file using whisper.cpp."""
        audio_path = Path(audio_path)
        if not audio_path.exists():
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        # Build the command
        cmd = [
            str(self.whisper_path),
            "-m",
            str(self.model_path),
            "-f",
            str(audio_path),
            "-t",
            str(self.threads),
            "-l",
            "auto",
        ]

        # Run whisper.cpp
        try:
            # Execute the command
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )

            # Get the output and error (if any)
            output, error = process.communicate()

            # Only raise an error if the process failed or if there's actual error output
            if process.returncode != 0:
                error_msg = error.decode("utf-8") if error else "Unknown error"
                raise RuntimeError(f"Error processing audio: {error_msg}")

            # Process and return the output string
            decoded_str = output.decode("utf-8").strip()
            segments = []

            for line in decoded_str.split("\n"):
                line = line.strip()
                if not line:
                    continue

                # Check if line contains a timestamp
                if "-->" in line:
                    try:
                        # Split the line into timestamp and text parts
                        timestamp_part, text = line.split("]", 1)
                        timestamp_part = timestamp_part.strip("[")

                        # Parse the timestamp
                        start_end = timestamp_part.split("-->")
                        start_time = (
                            self._parse_timestamp(start_end[0].strip()) * 1000
                        )  # Convert to ms
                        end_time = (
                            self._parse_timestamp(start_end[1].strip()) * 1000
                        )  # Convert to ms

                        # Create a segment
                        segment = TranscriptionSegment(
                            timestamp=Timestamp(start=start_time, end=end_time),
                            text=text.strip(),
                        )
                        segments.append(segment)
                    except (ValueError, IndexError) as e:
                        print(f"Error parsing line: {line}, error: {e}")
                        continue

            return TranscriptionResult(
                segments=segments, language=self.language or "en", duration=0
            )

        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"Whisper.cpp failed: {e.stderr}") from e

    def _parse_timestamp(self, timestamp_str: str) -> float:
        """Convert timestamp string (HH:MM:SS.mmm) to seconds."""
        hours, minutes, seconds = timestamp_str.split(":")
        return float(hours) * 3600 + float(minutes) * 60 + float(seconds)


class OpenAITranscriptionProvider(TranscriptionProvider):
    """Provider for OpenAI's transcription API."""

    def __init__(
        self,
        api_key: str,
        model: str = "whisper-1",
        language: Optional[str] = None,
        threads: int = 4,
    ) -> None:
        """Initialize the OpenAI provider.

        Args:
            api_key: OpenAI API key
            model: Model to use (default: whisper-1)
            language: Optional language code
            temperature: Sampling temperature
        """
        self.api_key = api_key
        self.model = model
        self.language = language
        self.threads = threads

    def transcribe(self, audio_path: str | Path) -> TranscriptionResult:
        """Transcribe the audio file using OpenAI's API."""
        # TODO: Implement OpenAI API call
        raise NotImplementedError("OpenAI implementation pending configuration details")
