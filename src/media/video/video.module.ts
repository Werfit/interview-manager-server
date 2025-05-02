import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AttachmentModule } from 'src/attachment/attachment.module';

import { AudioModule } from '../audio/audio.module';
import { ThumbnailModule } from '../thumbnail/thumbnail.module';
import { ProcessVideoHandler } from './handlers/process-video.handler';
import { VIDEO_QUEUE_NAME } from './video.constants';
import { VideoProcessor } from './video.processor';
import { VideoService } from './video.service';

@Module({
  imports: [
    AttachmentModule,
    ThumbnailModule,
    AudioModule,
    BullModule.registerQueue({
      name: VIDEO_QUEUE_NAME,
    }),
  ],
  providers: [VideoService, VideoProcessor, ProcessVideoHandler],
  exports: [VideoService],
})
export class VideoModule {}
