import { rm } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { basename } from 'node:path';

import { InjectQueue } from '@nestjs/bullmq';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { AttachmentStatus, AttachmentType } from '@prisma/client';
import { Queue } from 'bullmq';
import { AttachmentService } from 'src/attachment/attachment.service';
import { fileManager } from 'src/shared/helpers/file-manager.helper';
import { tryCatch } from 'src/shared/utilities/try-catch/try-catch.utility';

import { CleanupVideoDto } from './dto/cleanup-video.dto';
import { CombineVideoDto } from './dto/combine-video.dto';
import { CreateVideoDto } from './dto/create-video.dto';
import { DeleteVideoDto } from './dto/delete-video.dto';
import { FinalizeVideoDto } from './dto/finalize-video.dto';
import { FindVideoDto } from './dto/find-video.dto';
import { StartConversionToMp4Dto } from './dto/start-conversion.dto';
import { VerifyVideoExistenceDto } from './dto/verify-video-existence.dto';
import { VIDEO_QUEUE_NAME } from './video.constants';
import { VideoJobData } from './video.processor';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);
  constructor(
    private readonly attachmentService: AttachmentService,
    @InjectQueue(VIDEO_QUEUE_NAME)
    private readonly videoQueue: Queue<VideoJobData>,
  ) {}

  async create(data: CreateVideoDto) {
    this.logger.log('VideoService::create', data);

    return this.attachmentService.create({
      type: AttachmentType.VIDEO,
      create: {
        url: data.url,
        interviewId: data.interviewId,
      },
    });
  }

  async finalize(data: FinalizeVideoDto) {
    return this.attachmentService.update({
      id: data.videoId,
      type: AttachmentType.VIDEO,
      update: {
        url: data.url,
        status: AttachmentStatus.COMPLETED,
      },
    });
  }

  async exists(data: VerifyVideoExistenceDto) {
    const attachment = await this.attachmentService.find({
      where: { id: data.id },
      type: AttachmentType.VIDEO,
    });

    if (!attachment) {
      return null;
    }

    if (data.fileMustExist) {
      const exists = await fileManager.fileExists(attachment.url);

      if (!exists) {
        return null;
      }
    }

    return attachment;
  }

  async startConversionToMp4(data: StartConversionToMp4Dto) {
    return this.videoQueue.add(VIDEO_QUEUE_NAME, {
      videoUrl: data.videoUrl,
      videoId: data.metadata.videoId,
      interviewId: data.metadata.interviewId,
    });
  }

  async find(data: FindVideoDto) {
    return this.attachmentService.find({
      where: { id: data.id },
      type: AttachmentType.VIDEO,
    });
  }

  @Transactional()
  async delete(data: DeleteVideoDto) {
    const attachment = await this.attachmentService.find({
      where: { id: data.id },
      type: AttachmentType.VIDEO,
    });

    if (!attachment) {
      throw new NotFoundException('Video not found');
    }

    const sessionId = basename(attachment.url, extname(attachment.url));

    const thumbnailPath = join(
      fileManager.thumbnailPath,
      fileManager.getThumbnailFilename(sessionId),
    );

    await this.cleanup({
      sessionId,
      url: attachment.url,
    });
    await rm(thumbnailPath, { force: true });
    await this.attachmentService.delete(data.id);
  }

  /**
   * Cleanup the video file and the session folder
   */
  async cleanup(data: CleanupVideoDto) {
    const uploadPath = fileManager.getChunkFolderPath(data.sessionId);
    await rm(uploadPath, { recursive: true, force: true });
    await rm(data.url, { force: true });
  }

  /**
   * Combine chunks into a single video
   */
  async combine(data: CombineVideoDto) {
    const chunks = await fileManager.getChunks(data.sessionId);

    if (!chunks) {
      throw new NotFoundException('No chunks found');
    }

    const [success, mergedPath] = await tryCatch(async () =>
      fileManager.mergeChunks({
        sessionId: data.sessionId,
        chunks,
      }),
    );

    if (!success) {
      throw new InternalServerErrorException('Failed to merge chunks');
    }

    return mergedPath;
  }
}
