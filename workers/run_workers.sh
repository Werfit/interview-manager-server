#!/bin/bash

# Start transcription worker in background
uv run transcription.py &
TRANSCRIPTION_PID=$!

# Start embedding worker in background
uv run embedding.py &
EMBEDDING_PID=$!

# Function to handle cleanup
cleanup() {
    echo "Stopping workers..."
    kill $TRANSCRIPTION_PID
    kill $EMBEDDING_PID
    exit 0
}

# Set up trap for SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait $TRANSCRIPTION_PID
wait $EMBEDDING_PID