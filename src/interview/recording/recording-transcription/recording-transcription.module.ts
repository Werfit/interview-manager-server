import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EmbeddingDatabaseModule } from 'src/database/embedding-database/embedding-database.module';
import { EmbeddingModule } from 'src/embedding/embedding.module';
import { MediaModule } from 'src/media/media.module';
import { TranscriptionModule } from 'src/transcription/transcription.module';

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
