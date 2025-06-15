import { basename, extname, join } from 'node:path';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { NotificationsGateway } from 'apps/server/notifications/notifications.gateway';
import { fileManager } from 'apps/server/shared/helpers/file-manager.helper';
import { mediaProcessor } from 'apps/server/shared/helpers/media-processor.helper';
import { Job } from 'bullmq';

import { THUMBNAIL_QUEUE_NAME } from './thumbnail.constants';
import { ThumbnailService } from './thumbnail.service';

export type ThumbnailJobData = {
  videoPath: string;
  thumbnailId: string;
};

@Processor(THUMBNAIL_QUEUE_NAME)
export class ThumbnailProcessor extends WorkerHost {
  private readonly logger = new Logger(ThumbnailProcessor.name);

  constructor(
    private readonly thumbnailService: ThumbnailService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    super();
  }

  async process(job: Job<ThumbnailJobData>) {
    const { videoPath, thumbnailId } = job.data;
    const filename = basename(videoPath, extname(videoPath));
    const outputPath = join(
      fileManager.thumbnailPath,
      fileManager.getThumbnailFilename(filename),
    );

    await mediaProcessor.extractThumbnailFromVideo(videoPath, outputPath);

    this.logger.log('Thumbnail created at:', outputPath);

    const thumbnail = await this.thumbnailService.finalizeThumbnail({
      thumbnailId,
      attachmentUrl: outputPath,
    });

    if (thumbnail.interviewRecordingThumbnail) {
      this.notificationsGateway.notifyRecordingThumbnailStatusUpdate(
        thumbnail.interviewRecordingThumbnail.id,
        {
          url: thumbnail.url,
          status: thumbnail.status,
          interviewId: thumbnail.interviewRecordingThumbnail.interviewId,
        },
      );
    }

    return outputPath;
  }
}
