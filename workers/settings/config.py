"""
This module contains the settings for the application.

The settings are loaded from the environment variables.
"""

from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings with environment variable validation."""

    RABBIT_MQ_HOST: str = Field(default="localhost", env="RABBIT_MQ_HOST")
    RABBIT_MQ_PORT: int = Field(default=5672, env="RABBIT_MQ_PORT")
    RABBIT_MQ_USER: Optional[str] = Field(default=None, env="RABBIT_MQ_USER")
    RABBIT_MQ_PASSWORD: Optional[str] = Field(default=None, env="RABBIT_MQ_PASSWORD")
    RABBIT_MQ_QUEUE: str = Field(env="RABBIT_MQ_QUEUE")

    # Pyannote settings
    PYANNOTE_AUTH_TOKEN: str = Field(
        env="PYANNOTE_AUTH_TOKEN",
        description="Authentication token for pyannote.audio models",
    )

    # Whisper.cpp settings
    WHISPER_PATH: Path = Field(
        default=Path("/usr/local/bin/whisper"),
        env="WHISPER_PATH",
        description="Path to the whisper.cpp executable",
    )
    WHISPER_MODEL_PATH: Path = Field(
        default=Path("/usr/local/share/whisper/models/ggml-base.bin"),
        env="WHISPER_MODEL_PATH",
        description="Path to the whisper model file",
    )
    WHISPER_LANGUAGE: Optional[str] = Field(
        default=None,
        env="WHISPER_LANGUAGE",
        description="Language code for transcription (e.g., 'en', 'es')",
    )
    WHISPER_THREADS: int = Field(
        default=4,
        env="WHISPER_THREADS",
        description="Number of threads to use for transcription",
    )

    # OpenAI settings (for future use)
    OPENAI_API_KEY: Optional[str] = Field(
        default=None,
        env="OPENAI_API_KEY",
        description="OpenAI API key for transcription",
    )
    OPENAI_MODEL: str = Field(
        default="whisper-1",
        env="OPENAI_MODEL",
        description="OpenAI model to use for transcription",
    )

    # ChromaDB settings
    CHROMA_DB_HOST: str = Field(
        default="localhost",
        env="CHROMA_DB_HOST",
        description="ChromaDB server host",
    )
    CHROMA_DB_PORT: int = Field(
        default=8000,
        env="CHROMA_DB_PORT",
        description="ChromaDB server port",
    )
    CHROMA_DB_COLLECTION: str = Field(
        default="transcription_embeddings",
        env="CHROMA_DB_COLLECTION",
        description="Default collection name for transcription embeddings",
    )

    # Ollama settings
    OLLAMA_URL: str = Field(
        default="http://localhost:11434",
        env="OLLAMA_URL",
        description="Ollama server URL",
    )
    OLLAMA_MODEL: str = Field(
        default="llama2",
        env="OLLAMA_MODEL",
        description="Ollama model to use",
    )

    class Config:
        """Configuration for the settings."""

        env_file = ".env"
        case_sensitive = True


# Create a global settings instance
settings = Settings()
