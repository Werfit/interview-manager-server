import { Injectable, Logger } from '@nestjs/common';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  Attachment,
  AttachmentStatus,
  Candidate,
  Prisma,
} from '@prisma/client';
import { AttachmentService } from 'src/file-uploader/services/attachment.service';
import { FileManagerService } from 'src/file-uploader/services/file-manager.service';
import { tryCatch } from 'src/shared/utilities/try-catch/try-catch.utility';

@Injectable()
export class CandidateService {
  private readonly logger = new Logger(CandidateService.name);

  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    private readonly attachmentService: AttachmentService,
    private readonly fileManagerService: FileManagerService,
  ) {}

  async checkIfExists(email: string) {
    const candidate = await this.txHost.tx.candidate.count({
      where: { email },
    });

    return candidate > 0;
  }

  async createCandidate(
    data: Pick<Prisma.CandidateCreateInput, 'name' | 'email' | 'phone' | 'cv'>,
  ) {
    this.logger.debug('CandidateService::createCandidate', {
      data,
    });

    const [candidateCreateSuccess, candidate] = await tryCatch(() =>
      this.txHost.tx.candidate.create({
        data,
      }),
    );

    if (!candidateCreateSuccess) {
      this.logger.error(candidate);
      return null;
    }
    return candidate;
  }

  async getCandidate(data: Pick<Candidate, 'id'>) {
    return this.txHost.tx.candidate.findUnique({
      where: { id: data.id },
      include: {
        cv: true,
      },
    });
  }

  @Transactional()
  async uploadCandidateCV(
    data: Pick<Candidate, 'id'> & Pick<Attachment, 'url'>,
  ) {
    const candidateCv = await this.attachmentService.findCandidateCV(data);

    if (candidateCv) {
      await this.fileManagerService.deletePDF(candidateCv.url);
    }

    const [candidateCvCreateSuccess, response] = await tryCatch(() =>
      this.attachmentService.createPDF({
        candidateId: data.id,
        status: AttachmentStatus.COMPLETED,
        url: data.url,
      }),
    );

    if (!candidateCvCreateSuccess) {
      this.logger.error(candidateCv);
      return null;
    }

    return response;
  }

  @Transactional()
  async deleteCandidateCV(id: string) {
    const candidateCv = await this.attachmentService.findCandidateCV({ id });

    if (!candidateCv) {
      return null;
    }

    await this.fileManagerService.deletePDF(candidateCv.url);
    await this.attachmentService.deleteAttachment(candidateCv.id);
  }
}
