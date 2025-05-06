import { Module } from '@nestjs/common';

import { AudioModule } from '../audio/audio.module';
import { VideoService } from './video.service';

@Module({
  imports: [AudioModule],
  providers: [VideoService],
  exports: [VideoService],
})
export class VideoModule {}
