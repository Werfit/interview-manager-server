import { Module } from '@nestjs/common';
import { MediaModule } from 'src/media/media.module';

import { RecordingController } from './recording.controller';
import { RecordingService } from './recording.service';
import { TranscriptionModule } from './transcription/transcription.module';

@Module({
  imports: [MediaModule, TranscriptionModule],
  providers: [RecordingService],
  controllers: [RecordingController],
})
export class RecordingModule {}
