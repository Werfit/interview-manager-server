import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { RecordingService } from '../recording.service';
import { TranscriptionEmbeddedEvent } from '../recording-transcription/events/transcription-embedded.event';

@EventsHandler(TranscriptionEmbeddedEvent)
export class TranscriptionEmbeddedHandler
  implements IEventHandler<TranscriptionEmbeddedEvent>
{
  private readonly logger = new Logger(TranscriptionEmbeddedHandler.name);
  constructor(private readonly recordingService: RecordingService) {}

  async handle(event: TranscriptionEmbeddedEvent) {
    this.logger.log(
      `Transcription embedded for recording ${event.recordingId}`,
    );
    await this.recordingService.setEmbedded(event.recordingId);
  }
}
