import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MediaModule } from 'src/media/media.module';

import { StartEmbeddingHandler } from './handlers/start-embedding.handler';
import { StartTranscriptionHandler } from './handlers/start-transcription.handler';
import { TRANSCRIPTION_SERVICE_NAME } from './transcription.constants';
import { TranscriptionConsumer } from './transcription.consumer';
import { TranscriptionController } from './transcription.controller';
import { TranscriptionService } from './transcription.service';

@Module({
  imports: [
    ClientsModule.registerAsync({
      clients: [
        {
          name: TRANSCRIPTION_SERVICE_NAME,
          useFactory: (configService: ConfigService) => ({
            transport: Transport.RMQ,
            options: {
              urls: [configService.getOrThrow<string>('rabbit-mq.url')],
              queue: configService.getOrThrow<string>('rabbit-mq.queue'),
              queueOptions: {
                durable: true,
              },
            },
          }),
          inject: [ConfigService],
        },
      ],
    }),
    MediaModule,
  ],
  providers: [
    TranscriptionService,
    StartTranscriptionHandler,
    StartEmbeddingHandler,
  ],
  exports: [TranscriptionService],
  controllers: [TranscriptionController, TranscriptionConsumer],
})
export class TranscriptionModule {}
