import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { AUDIO_QUEUE_NAME } from './audio.constants';
import { AudioService } from './audio.service';
import { AudioProcessor } from './processors/audio.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: AUDIO_QUEUE_NAME,
    }),
  ],
  providers: [AudioService, AudioProcessor],
  exports: [AudioService],
})
export class AudioModule {}
