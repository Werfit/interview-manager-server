import { Module } from '@nestjs/common';
import { FileUploaderModule } from 'src/file-uploader/file-uploader.module';

import { RecordingController } from './recording.controller';
import { RecordingService } from './recording.service';

@Module({
  imports: [FileUploaderModule],
  providers: [RecordingService],
  controllers: [RecordingController],
})
export class RecordingModule {}
