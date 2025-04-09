import { basename, extname, join } from 'node:path';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as ffmpeg from 'fluent-ffmpeg';
import { fileManager } from 'src/shared/helpers/file-manager.helper';

import { QueueNames } from '../file-uploader.constants';
import { AttachmentService } from '../services/attachment.service';

export type ThumbnailJobData = {
  videoId: string;
  videoPath: string;
};

@Processor(QueueNames.Thumbnail)
export class ThumbnailProcessor extends WorkerHost {
  private readonly logger = new Logger(ThumbnailProcessor.name);

  constructor(private readonly thumbnailService: AttachmentService) {
    super();
  }

  async process(job: Job<ThumbnailJobData>) {
    const { videoPath, videoId } = job.data;
    const filename = basename(videoPath, extname(videoPath));
    const outputPath = join(
      fileManager.thumbnailPath,
      fileManager.getThumbnailFilename(filename),
    );

    return new Promise<string>((resolve, reject) => {
      ffmpeg(videoPath)
        .on('end', () => {
          this.logger.log('Thumbnail created at:', outputPath);
          this.thumbnailService.createThumbnail({
            videoId: videoId,
            thumbnailPathname: outputPath,
          });
          resolve(outputPath);
        })
        .on('error', (error) => {
          this.logger.error('Failed to generate thumbnail', error);
          reject(error);
        })
        .screenshots({
          timestamps: ['2'],
          filename: `${filename}.jpg`,
          folder: fileManager.thumbnailPath,
        });
    });
  }
}
