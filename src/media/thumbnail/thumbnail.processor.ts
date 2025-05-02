import { basename, extname, join } from 'node:path';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { fileManager } from 'src/shared/helpers/file-manager.helper';
import { mediaProcessor } from 'src/shared/helpers/media-processor.helper';

import { THUMBNAIL_QUEUE_NAME } from './thumbnail.constants';
import { ThumbnailService } from './thumbnail.service';

export type ThumbnailJobData = {
  videoId: string;
  videoPath: string;
};

@Processor(THUMBNAIL_QUEUE_NAME)
export class ThumbnailProcessor extends WorkerHost {
  private readonly logger = new Logger(ThumbnailProcessor.name);

  constructor(private readonly thumbnailService: ThumbnailService) {
    super();
  }

  async process(job: Job<ThumbnailJobData>) {
    const { videoPath, videoId } = job.data;
    const filename = basename(videoPath, extname(videoPath));
    const outputPath = join(
      fileManager.thumbnailPath,
      fileManager.getThumbnailFilename(filename),
    );

    await mediaProcessor.extractThumbnailFromVideo(videoPath, outputPath);

    this.logger.log('Thumbnail created at:', outputPath);
    await this.thumbnailService.createThumbnail({
      videoId: videoId,
      url: outputPath,
    });

    return outputPath;
  }
}
