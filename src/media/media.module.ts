import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { fileManager } from 'src/shared/helpers/file-manager.helper';

import { AudioModule } from './audio/audio.module';
import { DocumentModule } from './document/document.module';
import { ImageModule } from './image/image.module';
import { VideoModule } from './video/video.module';

@Module({
  imports: [
    VideoModule,
    AudioModule,
    DocumentModule,
    ImageModule,
    ServeStaticModule.forRoot({
      rootPath: fileManager.uploadPath,
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
        fallthrough: false,
      },
    }),
  ],
  exports: [VideoModule, AudioModule, DocumentModule, ImageModule],
})
export class MediaModule {}
