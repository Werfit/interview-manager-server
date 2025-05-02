import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AttachmentModule } from 'src/attachment/attachment.module';

import { THUMBNAIL_QUEUE_NAME } from './thumbnail.constants';
import { ThumbnailProcessor } from './thumbnail.processor';
import { ThumbnailService } from './thumbnail.service';

@Module({
  imports: [
    AttachmentModule,
    BullModule.registerQueue({
      name: THUMBNAIL_QUEUE_NAME,
    }),
  ],
  providers: [ThumbnailService, ThumbnailProcessor],
  exports: [ThumbnailService],
})
export class ThumbnailModule {}
