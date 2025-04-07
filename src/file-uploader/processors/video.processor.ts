import { basename, extname, join } from 'node:path';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as ffmpeg from 'fluent-ffmpeg';

import { QueueNames } from '../file-uploader.constants';
import { getUploadPath } from '../file-uploader.utility';
import { AttachmentService } from '../services/attachment.service';
import { FileManagerService } from '../services/file-manager.service';

export type VideoJobData = {
  videoId: string;
  videoPath: string;
};

@Processor(QueueNames.Video)
export class VideoProcessor extends WorkerHost {
  private readonly logger = new Logger(VideoProcessor.name);

  constructor(
    private readonly attachmentService: AttachmentService,
    private readonly fileManagerService: FileManagerService,
  ) {
    super();
  }

  async process(job: Job<VideoJobData>) {
    this.logger.log('VideoProcessor::process', job.data);
    const { videoPath, videoId } = job.data;
    const filename = basename(videoPath, extname(videoPath));
    const outputPath = join(getUploadPath(), `${filename}.mp4`);

    return new Promise<string>((resolve, reject) => {
      ffmpeg(videoPath)
        .on('end', () => {
          this.logger.log('Video created at:', outputPath);

          Promise.all([
            this.attachmentService.finalizeVideo({
              videoId: videoId,
              videoPathname: outputPath,
            }),
            this.fileManagerService.cleanupSession({
              sessionId: videoId,
              videoPathname: videoPath,
            }),
          ]).then(() => {
            resolve(outputPath);
          });
        })
        .on('error', (error) => {
          this.logger.error('Failed to convert video', error);
          reject(error);
        })
        .outputOptions([
          '-c:v libx264',
          '-preset veryfast',
          '-crf 23',
          '-c:a aac',
        ])
        .save(outputPath);
    });
  }
}
