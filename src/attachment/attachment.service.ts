import { Injectable, Logger } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { AttachmentType } from '@prisma/client';

import {
  CreateAttachmentData,
  CreateThumbnailAttachmentData,
  FindAttachmentData,
  UpdateAttachmentData,
} from './attachment.types';

@Injectable()
export class AttachmentService {
  private readonly logger = new Logger(AttachmentService.name);

  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async create(data: CreateAttachmentData) {
    this.logger.log('AttachmentService::create', data);
    if (data.type === AttachmentType.PDF) {
      return this.txHost.tx.attachment.create({
        data: {
          type: data.type,
          ...data.create,
        },
      });
    }

    if (data.type === AttachmentType.IMAGE) {
      return this.createImageThumbnail(data);
    }

    return this.txHost.tx.attachment.create({
      data: {
        type: data.type,
        ...data.create,
      },
    });
  }

  async update(data: UpdateAttachmentData) {
    this.logger.log('AttachmentService::update', data);
    return this.txHost.tx.attachment.update({
      where: { id: data.id, type: data.type },
      data: data.update,
    });
  }

  async find(data: FindAttachmentData) {
    this.logger.log('AttachmentService::find', data);
    if (data.type === AttachmentType.VIDEO) {
      return this.txHost.tx.attachment.findUnique({
        where: {
          ...data.where,
          type: data.type,
        },
      });
    }

    return this.txHost.tx.attachment.findUnique({
      where: {
        ...data.where,
        type: data.type,
        candidateId: data.where.candidateId,
      },
    });
  }

  async delete(id: string) {
    this.logger.log('AttachmentService::delete', id);
    return this.txHost.tx.attachment.delete({
      where: {
        id,
      },
    });
  }

  private async createImageThumbnail(data: CreateThumbnailAttachmentData) {
    if (data.create.videoId) {
      return this.txHost.tx.attachment.create({
        data: {
          type: data.type,
          url: data.create.url,
          status: data.create.status,
          thumbnailFor: {
            connect: {
              id: data.create.videoId,
            },
          },
        },
      });
    }

    return this.txHost.tx.attachment.create({
      data: {
        type: data.type,
        ...data.create,
      },
    });
  }
}
