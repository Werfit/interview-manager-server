import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Job } from 'bullmq';

import { AudioTranscribedEvent } from './events/audio-transcribed.event';
import { AudioTranscriptionFailedEvent } from './events/audio-transcription-failed.event';
import { TRANSCRIPTION_QUEUE_NAME } from './transcription.constants';
import { TranscriptionProvider } from './transcription-provider.service';

export type TranscriptionJobData = {
  audioUrl: string;
  metadata: {
    transcriptionId: string;
  };
};

@Processor(TRANSCRIPTION_QUEUE_NAME)
export class TranscriptionProcessor extends WorkerHost {
  private readonly logger = new Logger(TranscriptionProcessor.name);

  constructor(
    private readonly transcriptionProvider: TranscriptionProvider,
    private readonly eventBus: EventBus,
  ) {
    super();
  }

  async process(job: Job<TranscriptionJobData>) {
    const { audioUrl, metadata } = job.data;

    try {
      const result = await this.transcriptionProvider.transcribe(audioUrl);

      if (!result) {
        this.logger.error('Transcription failed');
        await this.eventBus.publish(
          new AudioTranscriptionFailedEvent({
            transcriptionId: metadata.transcriptionId,
          }),
        );
        return;
      }

      await this.eventBus.publish(
        new AudioTranscribedEvent(result.text, {
          transcriptionId: metadata.transcriptionId,
          segments: result.segments,
        }),
      );
    } catch (error) {
      console.error('Transcription failed:', error);
      throw error;
    }
  }
}
