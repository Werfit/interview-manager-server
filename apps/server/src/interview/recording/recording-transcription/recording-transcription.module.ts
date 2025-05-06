import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MediaModule } from 'apps/server/media/media.module';
import { TranscriptionModule } from 'apps/server/transcription/transcription.module';
import { EmbeddingModule } from 'libs/embedding';
import { EmbeddingDatabaseModule } from 'libs/embedding-database';

import { AudioExtractedHandler } from './handlers/audio-extracted.handler';
import { AudioTranscribedHandler } from './handlers/audio-transcribed.handler';
import { TRANSCRIPTION_QUEUE_NAME } from './recording-transcription.constants';
import { RecordingTranscriptionController } from './recording-transcription.controller';
import { RecordingTranscriptionProcessor } from './recording-transcription.processor';
import { RecordingTranscriptionService } from './recording-transcription.service';

@Module({
  imports: [
    MediaModule,
    TranscriptionModule,
    EmbeddingModule,
    EmbeddingDatabaseModule,
    BullModule.registerQueue({
      name: TRANSCRIPTION_QUEUE_NAME,
    }),
  ],
  providers: [
    RecordingTranscriptionService,
    AudioExtractedHandler,
    AudioTranscribedHandler,
    RecordingTranscriptionProcessor,
  ],
  exports: [RecordingTranscriptionService],
  controllers: [RecordingTranscriptionController],
})
export class RecordingTranscriptionModule {}
