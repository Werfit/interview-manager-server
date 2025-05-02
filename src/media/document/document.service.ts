import { rm } from 'node:fs/promises';

import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { AttachmentStatus, AttachmentType } from '@prisma/client';
import { AttachmentService } from 'src/attachment/attachment.service';

import { CreateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class DocumentService {
  constructor(private readonly attachmentService: AttachmentService) {}

  async create(data: CreateDocumentDto) {
    return this.attachmentService.create({
      type: AttachmentType.PDF,
      create: {
        url: data.url,
        candidateId: data.candidateId,
        status: AttachmentStatus.COMPLETED,
      },
    });
  }

  @Transactional()
  async delete(id: string) {
    const attachment = await this.attachmentService.find({
      where: { id },
      type: AttachmentType.PDF,
    });

    if (!attachment) {
      return null;
    }

    await Promise.all([
      rm(attachment.url, { force: true }),
      this.attachmentService.delete(id),
    ]);
  }
}
