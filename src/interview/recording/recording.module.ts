import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MediaModule } from 'src/media/media.module';

import { ProcessRecordingHandler } from './handlers/process-recording.handler';
import { RECORDING_QUEUE_NAME } from './recording.constants';
import { RecordingController } from './recording.controller';
import { RecordingProcessor } from './recording.processor';
import { RecordingService } from './recording.service';
import { RecordingTranscriptionModule } from './recording-transcription/recording-transcription.module';
import { ThumbnailModule } from './thumbnail/thumbnail.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: RECORDING_QUEUE_NAME,
    }),
    MediaModule,
    RecordingTranscriptionModule,
    ThumbnailModule,
  ],
  providers: [RecordingService, ProcessRecordingHandler, RecordingProcessor],
  controllers: [RecordingController],
})
export class RecordingModule {}
