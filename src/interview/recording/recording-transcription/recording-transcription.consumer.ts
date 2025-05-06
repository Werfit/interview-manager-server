import { Logger } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Payload } from '@nestjs/microservices';
import { MessagePattern } from '@nestjs/microservices';
import { TranscriptionStatus } from '@prisma/client';
import { AudioService } from 'src/media/audio/audio.service';

import { TranscriptionReadyDto } from './dto/transcription-ready.dto';
import { StartEmbeddingEvent } from './events/start-embedding.event';
import { RecordingTranscriptionService } from './recording-transcription.service';

@Controller()
export class RecordingTranscriptionConsumer {
  private readonly logger = new Logger(RecordingTranscriptionConsumer.name);

  constructor(
    private readonly transcriptionService: RecordingTranscriptionService,
    private readonly audioService: AudioService,
    private readonly eventBus: EventBus,
  ) {}

  @MessagePattern('transcription_ready')
  async handleTranscriptionReady(@Payload() data: TranscriptionReadyDto) {
    this.logger.log('Received transcription result:', data);

    const transcription = await this.transcriptionService.updateTranscription(
      data.transcriptionId,
      {
        content: data.segments.map((segment) => segment.text).join('\n'),
        status: TranscriptionStatus.COMPLETED,
      },
    );

    if (!transcription) {
      this.logger.error(
        `Failed to update transcription for interview ${data.interviewId}`,
      );

      return { received: false };
    }

    await this.audioService.cleanup({
      url: data.audioPath,
    });
    this.logger.log('Transcription created', transcription);

    this.eventBus.publish(
      new StartEmbeddingEvent(data.segments, {
        interviewId: data.interviewId,
        recordingId: data.attachmentId,
      }),
    );

    return { received: true };
  }
}
