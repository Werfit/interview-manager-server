import { rm } from 'node:fs/promises';

import { Injectable } from '@nestjs/common';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { AttachmentStatus, AttachmentType } from '@prisma/client';

import { CreateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class DocumentService {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async create(data: CreateDocumentDto) {
    return this.txHost.tx.attachment.create({
      data: {
        type: AttachmentType.PDF,
        url: data.url,
        status: AttachmentStatus.COMPLETED,
      },
    });
  }

  @Transactional()
  async delete(id: string) {
    const attachment = await this.txHost.tx.attachment.findUnique({
      where: { id, type: AttachmentType.PDF },
    });

    if (!attachment) {
      return null;
    }

    await Promise.all([
      rm(attachment.url, { force: true }),
      this.txHost.tx.attachment.delete({
        where: { id: attachment.id },
      }),
    ]);
  }
}
