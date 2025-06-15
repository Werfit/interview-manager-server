import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MediaModule } from 'apps/server/media/media.module';
import { NotificationsModule } from 'apps/server/notifications/notifications.module';

import { THUMBNAIL_QUEUE_NAME } from './thumbnail.constants';
import { ThumbnailProcessor } from './thumbnail.processor';
import { ThumbnailService } from './thumbnail.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: THUMBNAIL_QUEUE_NAME,
    }),
    MediaModule,
    NotificationsModule,
  ],
  providers: [ThumbnailService, ThumbnailProcessor],
  exports: [ThumbnailService],
})
export class ThumbnailModule {}
