import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { QueueNames } from './file-uploader.constants';
import { getUploadPath } from './file-uploader.utility';
import { ThumbnailProcessor } from './processors/thumbnail.processor';
import { VideoProcessor } from './processors/video.processor';
import { AttachmentService } from './services/attachment.service';
import { FileManagerService } from './services/file-manager.service';

@Module({
  providers: [
    FileManagerService,
    ThumbnailProcessor,
    AttachmentService,
    VideoProcessor,
  ],
  exports: [FileManagerService],
  imports: [
    // This here is for development purposes only. Must be replaced with S3
    ServeStaticModule.forRoot({
      rootPath: getUploadPath(),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
        fallthrough: false,
      },
    }),
    BullModule.registerQueue({
      name: QueueNames.Thumbnail,
    }),
    BullModule.registerQueue({
      name: QueueNames.Video,
    }),
  ],
})
export class FileUploaderModule {}
