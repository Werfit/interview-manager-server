import { Injectable, Logger } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  Attachment,
  AttachmentStatus,
  AttachmentType,
  Candidate,
} from '@prisma/client';

@Injectable()
export class AttachmentService {
  private readonly logger = new Logger(AttachmentService.name);
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async createPDF(data: Pick<Attachment, 'url' | 'status' | 'candidateId'>) {
    return this.txHost.tx.attachment.create({
      data: {
        type: AttachmentType.PDF,
        url: data.url,
        status: data.status,
        candidateId: data.candidateId,
      },
    });
  }

  async findCandidateCV(data: Pick<Candidate, 'id'>) {
    return this.txHost.tx.attachment.findFirst({
      where: {
        candidateId: data.id,
        type: AttachmentType.PDF,
      },
    });
  }

  async deleteAttachment(id: string) {
    return this.txHost.tx.attachment.delete({
      where: {
        id,
      },
    });
  }

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
