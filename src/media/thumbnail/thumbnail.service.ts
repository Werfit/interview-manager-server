import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { AttachmentStatus, AttachmentType } from '@prisma/client';
import { Queue } from 'bullmq';
import { AttachmentService } from 'src/attachment/attachment.service';

import { CreateThumbnailDto } from './dto/create-thumbnail.dto';
import { THUMBNAIL_QUEUE_NAME } from './thumbnail.constants';
import { ThumbnailJobData } from './thumbnail.processor';

@Injectable()
export class ThumbnailService {
  constructor(
    private readonly attachmentService: AttachmentService,
    @InjectQueue(THUMBNAIL_QUEUE_NAME)
    private readonly thumbnailQueue: Queue<ThumbnailJobData>,
  ) {}

  async createThumbnail(data: CreateThumbnailDto) {
    return this.attachmentService.create({
      type: AttachmentType.IMAGE,
      create: {
        url: data.url,
        status: AttachmentStatus.COMPLETED,
        videoId: data.videoId,
      },
    });
  }

  async startThumbnailGeneration(data: CreateThumbnailDto) {
    return this.thumbnailQueue.add(THUMBNAIL_QUEUE_NAME, {
      videoPath: data.url,
      videoId: data.videoId,
    });
  }
}
