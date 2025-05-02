"""
This module contains the worker for generating embeddings from transcription segments.
"""

from helpers import start_worker
from core.embedding.embedding_worker import EmbeddingWorker


def main() -> None:
    """Main entry point for the worker application."""
    start_worker(EmbeddingWorker, "EmbeddingWorker")


if __name__ == "__main__":
    main()
