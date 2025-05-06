import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { TranscriptionStatus } from '@prisma/client';
import { AudioTranscriptionFailedEvent } from 'src/transcription/events/audio-transcription-failed.event';

import { RecordingTranscriptionService } from '../recording-transcription.service';

@EventsHandler(AudioTranscriptionFailedEvent)
export class AudioTranscriptionFailedHandler
  implements IEventHandler<AudioTranscriptionFailedEvent>
{
  constructor(
    private readonly recordingTranscriptionService: RecordingTranscriptionService,
  ) {}

  async handle(event: AudioTranscriptionFailedEvent) {
    const { transcriptionId } = event.metadata;

    await this.recordingTranscriptionService.updateTranscription(
      transcriptionId,
      { status: TranscriptionStatus.FAILED, content: '' },
    );

    return new Promise((resolve) => resolve(event));
  }
}
