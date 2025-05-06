import { basename, extname, join } from 'node:path';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { fileManager } from 'src/shared/helpers/file-manager.helper';
import { mediaProcessor } from 'src/shared/helpers/media-processor.helper';
import { tryCatch } from 'src/shared/utilities/try-catch/try-catch.utility';

import { AudioService } from '../../media/audio/audio.service';
import { VideoService } from '../../media/video/video.service';
import { RECORDING_QUEUE_NAME } from './recording.constants';

export type RecordingJobData = {
  videoId: string;
  videoUrl: string;
  recordingId: string;
};

@Processor(RECORDING_QUEUE_NAME)
export class RecordingProcessor extends WorkerHost {
  private readonly logger = new Logger(RecordingProcessor.name);

  constructor(
    private readonly videoService: VideoService,
    private readonly audioService: AudioService,
  ) {
    super();
  }

  async process(job: Job<RecordingJobData>) {
    this.logger.log('RecordingProcessor::process', job.data);

    const { videoUrl, videoId, recordingId } = job.data;
    const filename = basename(videoUrl, extname(videoUrl));

    const outputPath = join(
      fileManager.uploadPath,
      fileManager.getRecordingFilename(filename),
    );

    const convertedVideoPath = await mediaProcessor.convertVideoToMp4(
      videoUrl,
      outputPath,
    );

    await tryCatch(() => {
      return Promise.all([
        this.videoService.finalize({
          videoId: videoId,
          url: convertedVideoPath,
        }),
        this.videoService.cleanup({
          sessionId: videoId,
          url: videoUrl,
        }),
        this.audioService.createFromVideo({
          videoUrl: convertedVideoPath,
          metadata: {
            videoId,
            recordingId,
          },
        }),
      ]);
    });
  }
}
