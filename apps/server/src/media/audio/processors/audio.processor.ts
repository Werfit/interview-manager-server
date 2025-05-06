import { join } from 'node:path';
import { dirname } from 'node:path';
import { basename, extname } from 'node:path';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Job } from 'bullmq';
import { fileManager } from 'apps/server/shared/helpers/file-manager.helper';
import { mediaProcessor } from 'apps/server/shared/helpers/media-processor.helper';

import { AUDIO_QUEUE_NAME } from '../audio.constants';
import { ExtractedAudioEvent } from '../events/extracted-audio.event';

export type AudioJobData = {
  videoId: string;
  videoUrl: string;
  recordingId: string;
};

@Processor(AUDIO_QUEUE_NAME)
export class AudioProcessor extends WorkerHost {
  private readonly logger = new Logger(AudioProcessor.name);

  constructor(private readonly eventBus: EventBus) {
    super();
  }

  async process(job: Job<AudioJobData>) {
    this.logger.log('AudioProcessor::process', job.data);

    const { videoUrl: videoPath } = job.data;

    const filename = basename(videoPath, extname(videoPath));
    const outputPath = join(
      dirname(videoPath),
      fileManager.getAudioFilename(filename),
    );

    const audioUrl = await mediaProcessor.extractAudioFromVideo(
      videoPath,
      outputPath,
    );

    if (!audioUrl) {
      throw new Error('Failed to create audio from video');
    }

    this.eventBus.publish(
      new ExtractedAudioEvent(audioUrl, {
        recordingId: job.data.recordingId,
        attachmentId: job.data.videoId,
      }),
    );
  }
}
