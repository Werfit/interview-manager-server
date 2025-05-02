import { Inject, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { TranscriptionStatus } from '@prisma/client';

import { StartTranscriptionEvent } from '../events/start-transcription.event';
import { TRANSCRIPTION_SERVICE_NAME } from '../transcription.constants';
import { TranscriptionService } from '../transcription.service';

@EventsHandler(StartTranscriptionEvent)
export class StartTranscriptionHandler
  implements IEventHandler<StartTranscriptionEvent>
{
  private readonly logger = new Logger(StartTranscriptionHandler.name);

  constructor(
    @Inject(TRANSCRIPTION_SERVICE_NAME)
    private readonly rabbitMQService: ClientProxy,
    private readonly transcriptionService: TranscriptionService,
  ) {}

  async handle(event: StartTranscriptionEvent) {
    const transcription = await this.transcriptionService.createTranscription({
      interviewId: event.metadata.interviewId,
      recordingId: event.metadata.attachmentId,
      content: '',
      status: TranscriptionStatus.PENDING,
    });

    if (!transcription) {
      this.logger.error(
        `Failed to create transcription for interview ${event.metadata.interviewId}`,
      );

      return;
    }

    return this.rabbitMQService.emit('audio_transcription', {
      audioPath: event.audioPath,
      attachmentId: event.metadata.attachmentId,
      interviewId: event.metadata.interviewId,
      transcriptionId: transcription.id,
    });
  }
}
