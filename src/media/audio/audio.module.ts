import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AttachmentModule } from 'src/attachment/attachment.module';

import { AUDIO_QUEUE_NAME } from './audio.constants';
import { AudioProcessor } from './audio.processor';
import { AudioService } from './audio.service';

@Module({
  imports: [
    AttachmentModule,
    BullModule.registerQueue({
      name: AUDIO_QUEUE_NAME,
    }),
  ],
  providers: [AudioService, AudioProcessor],
  exports: [AudioService],
})
export class AudioModule {}
