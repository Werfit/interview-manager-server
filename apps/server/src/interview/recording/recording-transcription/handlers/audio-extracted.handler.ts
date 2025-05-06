import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { TranscriptionStatus } from '@prisma/client';
import { ExtractedAudioEvent } from 'apps/server/media/audio/events/extracted-audio.event';
import { TranscriptionService } from 'apps/server/transcription/transcription.service';

import { RecordingTranscriptionService } from '../recording-transcription.service';

@EventsHandler(ExtractedAudioEvent)
export class AudioExtractedHandler
  implements IEventHandler<ExtractedAudioEvent>
{
  private readonly logger = new Logger(AudioExtractedHandler.name);

  constructor(
    private readonly recordingTranscriptionService: RecordingTranscriptionService,
    private readonly transcriptionService: TranscriptionService,
  ) {}

  async handle(event: ExtractedAudioEvent) {
    const transcription =
      await this.recordingTranscriptionService.createTranscription({
        recordingId: event.metadata.recordingId,
        content: '',
        status: TranscriptionStatus.PENDING,
      });

    if (!transcription) {
      this.logger.error(
        `Failed to create transcription for recording ${event.metadata.recordingId}`,
      );

      return;
    }

    return this.transcriptionService.startTranscriptionGeneration({
      audioUrl: event.audioUrl,
      transcriptionId: transcription.id,
    });
  }
}
