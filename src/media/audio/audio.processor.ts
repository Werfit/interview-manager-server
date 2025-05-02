import { join } from 'node:path';
import { dirname } from 'node:path';
import { basename, extname } from 'node:path';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Job } from 'bullmq';
import { StartTranscriptionEvent } from 'src/interview/recording/transcription/events/start-transcription.event';
import { fileManager } from 'src/shared/helpers/file-manager.helper';
import { mediaProcessor } from 'src/shared/helpers/media-processor.helper';

import { AUDIO_QUEUE_NAME } from './audio.constants';

export type AudioJobData = {
  videoId: string;
  videoUrl: string;
  interviewId: string;
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

    const audioPath = await mediaProcessor.extractAudioFromVideo(
      videoPath,
      outputPath,
    );

    if (!audioPath) {
      throw new Error('Failed to create audio from video');
    }

    this.eventBus.publish(
      new StartTranscriptionEvent(audioPath, {
        interviewId: job.data.interviewId,
        attachmentId: job.data.videoId,
      }),
    );
  }
}
