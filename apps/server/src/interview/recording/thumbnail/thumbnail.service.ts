import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { AttachmentStatus } from '@prisma/client';
import { Queue } from 'bullmq';
import { ImageService } from 'apps/server/media/image/image.service';

import { CreateThumbnailDto } from './dto/create-thumbnail.dto';
import { FinalizeThumbnailDto } from './dto/finalize-thumbnail.dto';
import { StartThumbnailGenerationDto } from './dto/start-thumbnail-generation.dto';
import { THUMBNAIL_QUEUE_NAME } from './thumbnail.constants';
import { ThumbnailJobData } from './thumbnail.processor';

@Injectable()
export class ThumbnailService {
  constructor(
    private readonly imageService: ImageService,
    @InjectQueue(THUMBNAIL_QUEUE_NAME)
    private readonly thumbnailQueue: Queue<ThumbnailJobData>,
  ) {}

  async createThumbnail(data: CreateThumbnailDto) {
    return this.imageService.create({
      url: data.url,
      status: AttachmentStatus.PENDING,
    });
  }

  async finalizeThumbnail(data: FinalizeThumbnailDto) {
    return this.imageService.update({
      id: data.thumbnailId,
      url: data.attachmentUrl,
      status: AttachmentStatus.COMPLETED,
    });
  }

  async startThumbnailGeneration(data: StartThumbnailGenerationDto) {
    return this.thumbnailQueue.add(THUMBNAIL_QUEUE_NAME, {
      videoPath: data.url,
      thumbnailId: data.thumbnailId,
    });
  }
}
