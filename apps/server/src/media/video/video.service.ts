import { rm } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { basename } from 'node:path';

import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { AttachmentStatus, AttachmentType, Prisma } from '@prisma/client';
import { fileManager } from 'apps/server/shared/helpers/file-manager.helper';
import { tryCatch } from 'shared/utilities/try-catch/try-catch.utility';

import { CleanupVideoDto } from './dto/cleanup-video.dto';
import { CombineVideoDto } from './dto/combine-video.dto';
import { CreateVideoDto } from './dto/create-video.dto';
import { DeleteVideoDto } from './dto/delete-video.dto';
import { FinalizeVideoDto } from './dto/finalize-video.dto';
import { FindVideoDto } from './dto/find-video.dto';
import { VerifyVideoExistenceDto } from './dto/verify-video-existence.dto';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async create(data: CreateVideoDto) {
    this.logger.log('VideoService::create', data);

    return this.txHost.tx.attachment.create({
      data: {
        type: AttachmentType.VIDEO,
        url: data.url,
      },
    });
  }

  async finalize(data: FinalizeVideoDto, include?: Prisma.AttachmentInclude) {
    return this.txHost.tx.attachment.update({
      where: { id: data.videoId, type: AttachmentType.VIDEO },
      data: {
        url: data.url,
        status: AttachmentStatus.COMPLETED,
      },
      include,
    });
  }

  async exists(data: VerifyVideoExistenceDto) {
    const attachment = await this.txHost.tx.attachment.findUnique({
      where: { id: data.id, type: AttachmentType.VIDEO },
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

  async find(data: FindVideoDto) {
    return this.txHost.tx.attachment.findUnique({
      where: { id: data.id, type: AttachmentType.VIDEO },
    });
  }

  @Transactional()
  async delete(data: DeleteVideoDto) {
    const attachment = await this.txHost.tx.attachment.findUnique({
      where: { id: data.id, type: AttachmentType.VIDEO },
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
    await this.txHost.tx.attachment.delete({
      where: { id: data.id, type: AttachmentType.VIDEO },
    });
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
