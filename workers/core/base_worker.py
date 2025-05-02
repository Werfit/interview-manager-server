"""
This module contains the base worker class.
"""

import json
import logging
from typing import Any

import pika
from pika.adapters.blocking_connection import BlockingChannel
from pydantic import BaseModel
from settings.config import settings
from core.transcription.transcription_model import TranscriptionJobData


class BaseWorker:
    """Base worker class for handling audio transcription jobs."""

    def __init__(self, pattern: str, data_model: BaseModel) -> None:
        """Initialize the worker with RabbitMQ connection parameters."""
        self.credentials = None
        if settings.RABBIT_MQ_USER and settings.RABBIT_MQ_PASSWORD:
            self.credentials = pika.PlainCredentials(
                settings.RABBIT_MQ_USER, settings.RABBIT_MQ_PASSWORD
            )

        self.connection_params = pika.ConnectionParameters(
            host=settings.RABBIT_MQ_HOST,
            port=settings.RABBIT_MQ_PORT,
            credentials=self.credentials,
        )

        self.queue_name = settings.RABBIT_MQ_QUEUE
        self.logger = logging.getLogger(__name__)
        self.data_model = data_model
        self.connection = None
        self.channel = None
        self.pattern = pattern
        # Declare response queue
        self.response_queue = f"{settings.RABBIT_MQ_QUEUE}_response"

    def process_job(
        self, job_data: TranscriptionJobData, channel: BlockingChannel
    ) -> None:
        """Process a single job with the given data."""
        raise NotImplementedError("Subclasses must implement this method")

    def publish_response(
        self, channel: BlockingChannel, pattern: str, data: Any
    ) -> None:
        """Publish a response to the response queue."""
        response_message = {"pattern": pattern, "data": data}
        channel.basic_publish(
            exchange="",
            routing_key=self.response_queue,
            body=json.dumps(response_message),
        )

    def on_message(
        self, ch: BlockingChannel, method: Any, properties: Any, body: bytes
    ) -> None:
        """Callback function for handling incoming messages."""
        try:
            # Parse and validate the job data
            raw_data = json.loads(body)
            pattern = raw_data.get("pattern", None)

            if pattern == self.pattern:
                data = raw_data.get("data", None)
                job_data = self.data_model(**data)
                # Process the job
                self.process_job(job_data, ch)
                # Acknowledge the message
                ch.basic_ack(delivery_tag=method.delivery_tag)
            else:
                self.logger.info(
                    "Skipping message for pattern %s, requeuing for other workers",
                    pattern,
                )
                # Requeue the message for other workers to process
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

        except json.JSONDecodeError:
            self.logger.error("Failed to parse message as JSON")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        except Exception as e:
            self.logger.error("Error processing message: %s", str(e))
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

    def start(self) -> None:
        """Start the worker and begin consuming messages."""
        try:
            # Establish connection and channel, stored for graceful shutdown
            connection = pika.BlockingConnection(self.connection_params)
            self.connection = connection
            channel = connection.channel()
            self.channel = channel

            # Declare the queues
            channel.queue_declare(queue=self.queue_name, durable=True)
            channel.queue_declare(queue=self.response_queue, durable=True)

            # Set up message handling
            channel.basic_consume(
                queue=self.queue_name,
                on_message_callback=self.on_message,
                auto_ack=False,
            )

            self.logger.info("Worker started and waiting for messages...")
            channel.start_consuming()

        except Exception as e:
            self.logger.error("Error in worker: %s", str(e))
            raise
        finally:
            # Ensure connection is closed when consuming stops
            if self.connection and not getattr(self.connection, "is_closed", False):
                try:
                    self.connection.close()
                    self.logger.info("Connection closed for queue %s", self.queue_name)
                except Exception as close_err:
                    self.logger.error("Error closing connection: %s", str(close_err))

    def stop(self) -> None:
        """Stop consuming and close the connection gracefully."""
        if self.channel and getattr(self.channel, "is_open", False):
            self.logger.info("Stopping consumer for queue %s", self.queue_name)
            try:
                self.channel.stop_consuming()
            except Exception as stop_err:
                self.logger.error("Error stopping consumer: %s", str(stop_err))
        if self.connection and not getattr(self.connection, "is_closed", False):
            self.logger.info("Closing connection for queue %s", self.queue_name)
            try:
                self.connection.close()
            except Exception as close_err:
                self.logger.error("Error closing connection: %s", str(close_err))
