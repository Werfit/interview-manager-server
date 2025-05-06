import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { ITranscriptionSegment } from 'apps/server/transcription/providers/providers.types';
import { Job } from 'bullmq';
import { EmbeddingService } from 'libs/embedding';
import { EmbeddingDatabaseService } from 'libs/embedding-database';
import { tryCatch } from 'shared/utilities/try-catch/try-catch.utility';

import { TranscriptionEmbeddedEvent } from './events/transcription-embedded.event';
import { TRANSCRIPTION_QUEUE_NAME } from './recording-transcription.constants';

export type RecordingTranscriptionJobData = {
  segments: ITranscriptionSegment[];
  interviewId: string;
  recordingId: string;
};

@Processor(TRANSCRIPTION_QUEUE_NAME)
export class RecordingTranscriptionProcessor extends WorkerHost {
  private readonly logger = new Logger(RecordingTranscriptionProcessor.name);

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly embeddingDatabaseService: EmbeddingDatabaseService,
    private readonly eventBus: EventBus,
  ) {
    super();
  }

  async process(job: Job<RecordingTranscriptionJobData>) {
    const { segments, interviewId, recordingId } = job.data;

    const chunks = this.groupSegments(segments);

    const embedding = await this.embeddingService.embedText(
      chunks.map((chunk) => chunk.chunk),
    );

    const [success] = await tryCatch(async () => {
      await this.embeddingDatabaseService.addEmbeddings({
        ids: chunks.map((_, index) => `${recordingId}-${index}`),
        documents: chunks.map((chunk) => chunk.chunk),
        embeddings: embedding,
        metadatas: chunks.map((chunk) => ({
          interviewId,
          start: chunk.start,
          end: chunk.end,
        })),
      });
    });

    // Maybe deal with retry logic here
    if (!success) {
      this.logger.error(
        `Failed to add embeddings for interview ${interviewId}`,
      );

      return;
    }

    this.eventBus.publish(new TranscriptionEmbeddedEvent(recordingId));
  }

  /**
   * Groups transcription segments into overlapping chunks of text.
   * This is useful for processing long transcriptions in smaller, manageable pieces
   * while maintaining context through overlap between chunks.
   *
   * @param segments - Array of transcription segments with text and timing information
   * @param chunkCharLimit - Maximum characters per chunk (default: 1000)
   * @param overlap - Number of characters to overlap between chunks (default: 200)
   */
  private groupSegments(
    segments: ITranscriptionSegment[],
    chunkCharLimit = 1000,
    overlap = 200,
  ) {
    const chunks: {
      chunk: string;
      start: number;
      end: number;
    }[] = [];
    let buffer = '';
    let chunkStart = segments[0]?.start ?? 0;
    let chunkEnd = chunkStart;
    let index = 0;

    while (index < segments.length) {
      const seg = segments[index];

      // If adding this segment stays under the limit
      if (buffer.length + seg.text.length <= chunkCharLimit) {
        buffer += (buffer ? ' ' : '') + seg.text;
        chunkEnd = seg.end;
        index++;
        continue;
      }

      // Current chunk is full, save it and prepare for next chunk
      chunks.push({ chunk: buffer.trim(), start: chunkStart, end: chunkEnd });

      // Calculate overlap: Find the starting point for the next chunk
      // by backtracking through segments until we've covered the overlap amount
      const overlapStart = buffer.length - overlap;
      let backtrackChars = 0;
      let index_ = index;
      while (index_ > 0 && backtrackChars < overlapStart) {
        index_--;
        backtrackChars += segments[index_].text.length + 1;
      }

      // Reset for next chunk, starting from the overlap point
      index = index_;
      buffer = '';
      chunkStart = segments[index]?.start ?? 0;
    }

    // Don't forget to save the last chunk if there's remaining text
    if (buffer) {
      chunks.push({ chunk: buffer.trim(), start: chunkStart, end: chunkEnd });
    }

    return chunks;
  }
}
