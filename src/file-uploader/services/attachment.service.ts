import { Injectable, Logger } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Attachment, AttachmentStatus, AttachmentType } from '@prisma/client';

@Injectable()
export class AttachmentService {
  private readonly logger = new Logger(AttachmentService.name);
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async createThumbnail(data: {
    videoId: Attachment['id'];
    thumbnailPathname: Attachment['url'];
  }) {
    this.logger.log('AttachmentService::createThumbnail', data);
    const attachment = await this.txHost.tx.attachment.create({
      data: {
        type: AttachmentType.IMAGE,
        url: data.thumbnailPathname,
        status: AttachmentStatus.COMPLETED,
        thumbnailFor: {
          connect: {
            id: data.videoId,
          },
        },
      },
    });

    return attachment;
  }

  async finalizeVideo(data: {
    videoId: Attachment['id'];
    videoPathname: Attachment['url'];
  }) {
    this.logger.log('AttachmentService::finalizeVideo', data);
    const attachment = await this.txHost.tx.attachment.update({
      where: {
        id: data.videoId,
      },
      data: {
        url: data.videoPathname,
        status: AttachmentStatus.COMPLETED,
      },
    });

    return attachment;
  }
}
