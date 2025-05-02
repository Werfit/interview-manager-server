import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AttachmentModule } from 'src/attachment/attachment.module';
import { fileManager } from 'src/shared/helpers/file-manager.helper';

import { AudioModule } from './audio/audio.module';
import { DocumentModule } from './document/document.module';
import { ThumbnailModule } from './thumbnail/thumbnail.module';
import { VideoModule } from './video/video.module';

@Module({
  imports: [
    VideoModule,
    ThumbnailModule,
    AttachmentModule,
    AudioModule,
    DocumentModule,
    ServeStaticModule.forRoot({
      rootPath: fileManager.uploadPath,
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
        fallthrough: false,
      },
    }),
  ],
  exports: [VideoModule, ThumbnailModule, AudioModule, DocumentModule],
})
export class MediaModule {}
