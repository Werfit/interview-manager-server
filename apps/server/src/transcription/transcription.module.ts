import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { TRANSCRIPTION_QUEUE_NAME } from './transcription.constants';
import { TranscriptionProcessor } from './transcription.processor';
import { TranscriptionService } from './transcription.service';
import { TranscriptionProvider } from './transcription-provider.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: TRANSCRIPTION_QUEUE_NAME,
    }),
  ],
  providers: [
    {
      provide: TranscriptionProvider,
      useFactory: (configService: ConfigService) => {
        return new TranscriptionProvider({
          provider: 'whisper',
          url: configService.getOrThrow('transcription.url'),
          model: configService.getOrThrow('transcription.model'),
        });
      },
      inject: [ConfigService],
    },
    TranscriptionProcessor,
    TranscriptionService,
  ],
  exports: [TranscriptionService],
})
export class TranscriptionModule {}
