import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';

import { StartEmbeddingEvent } from '../events/start-embedding.event';
import { TRANSCRIPTION_SERVICE_NAME } from '../transcription.constants';

@EventsHandler(StartEmbeddingEvent)
export class StartEmbeddingHandler
  implements IEventHandler<StartEmbeddingEvent>
{
  constructor(
    @Inject(TRANSCRIPTION_SERVICE_NAME)
    private readonly rabbitMQService: ClientProxy,
  ) {}

  handle(event: StartEmbeddingEvent) {
    return this.rabbitMQService.emit('transcription_embedding', {
      interviewId: event.metadata.interviewId,
      recordingId: event.metadata.recordingId,
      segments: event.segments,
    });
  }
}
