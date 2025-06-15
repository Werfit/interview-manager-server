import { InjectQueue } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { TranscriptionStatus } from '@prisma/client';
import { AudioTranscribedEvent } from 'apps/server/transcription/events/audio-transcribed.event';
import { Queue } from 'bullmq';

import { TRANSCRIPTION_QUEUE_NAME } from '../recording-transcription.constants';
import { RecordingTranscriptionJobData } from '../recording-transcription.processor';
import { RecordingTranscriptionService } from '../recording-transcription.service';

@EventsHandler(AudioTranscribedEvent)
export class AudioTranscribedHandler
  implements IEventHandler<AudioTranscribedEvent>
{
  private readonly logger = new Logger(AudioTranscribedHandler.name);

  constructor(
    private readonly recordingTranscriptionService: RecordingTranscriptionService,
    @InjectQueue(TRANSCRIPTION_QUEUE_NAME)
    private readonly transcriptionQueue: Queue<RecordingTranscriptionJobData>,
  ) {}

  async handle(event: AudioTranscribedEvent) {
    this.logger.log(
      'AudioTranscribedHandler::handle',
      event.metadata.transcriptionId,
    );

    const transcription =
      await this.recordingTranscriptionService.updateTranscription(
        event.metadata.transcriptionId,
        {
          content: event.text,
          status: TranscriptionStatus.COMPLETED,
        },
      );

    if (!transcription) {
      this.logger.error(
        `Failed to update transcription for recording ${event.metadata.transcriptionId}`,
      );

      return;
    }

    return this.transcriptionQueue.add(TRANSCRIPTION_QUEUE_NAME, {
      segments: event.metadata.segments,
      interviewId: transcription.recording.interviewId,
      recordingId: transcription.recordingId,
    });
  }
}
