"""
This module contains helper functions for the application.
"""

import logging
import threading
import signal
from typing import Callable

from core.base_worker import BaseWorker


def setup_logging() -> None:
    """Configure logging for the application."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )


def setup_worker(target: Callable, name: str) -> threading.Thread:
    """Setup a worker thread."""
    thread = threading.Thread(target=target, name=name)
    thread.start()
    return thread


def start_worker(worker: BaseWorker, name: str) -> threading.Thread:
    """Start a worker thread."""
    setup_logging()
    instance = worker()

    def shutdown_handler(signum, frame):
        logging.info("Received shutdown signal %s, stopping workers...", signum)
        instance.stop()

    signal.signal(signal.SIGINT, shutdown_handler)
    signal.signal(signal.SIGTERM, shutdown_handler)

    thread = setup_worker(instance.start, name)
    thread.join()
