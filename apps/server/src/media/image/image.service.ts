import { rm } from 'node:fs/promises';

import { Injectable } from '@nestjs/common';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { AttachmentType, Prisma } from '@prisma/client';

import { CreateImageDto } from './dto/create-image.dto';
import { DeleteImageDto } from './dto/delete-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';

@Injectable()
export class ImageService {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async create(data: CreateImageDto) {
    return this.txHost.tx.attachment.create({
      data: {
        type: AttachmentType.IMAGE,
        url: data.url,
        status: data.status,
      },
    });
  }

  async update(data: UpdateImageDto, include?: Prisma.AttachmentInclude) {
    return this.txHost.tx.attachment.update({
      where: { id: data.id, type: AttachmentType.IMAGE },
      data: {
        url: data.url,
        status: data.status,
      },
      include,
    });
  }

  @Transactional()
  async delete(data: DeleteImageDto) {
    const attachment = await this.txHost.tx.attachment.findUnique({
      where: { id: data.id, type: AttachmentType.IMAGE },
    });

    if (!attachment) {
      return null;
    }

    await Promise.all([
      rm(attachment.url, { force: true }),
      this.txHost.tx.attachment.delete({
        where: { id: data.id, type: AttachmentType.IMAGE },
      }),
    ]);
  }
}
