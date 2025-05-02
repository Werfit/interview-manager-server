import { Injectable, Logger } from '@nestjs/common';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Attachment, Candidate, Prisma } from '@prisma/client';
import { DocumentService } from 'src/media/document/document.service';
import { tryCatch } from 'src/shared/utilities/try-catch/try-catch.utility';

@Injectable()
export class CandidateService {
  private readonly logger = new Logger(CandidateService.name);

  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    private readonly documentService: DocumentService,
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
    await this.documentService.delete(data.id);

    const [candidateCvCreateSuccess, response] = await tryCatch(() =>
      this.documentService.create({
        url: data.url,
        candidateId: data.id,
      }),
    );

    if (!candidateCvCreateSuccess) {
      this.logger.error(response);
      return null;
    }

    return response;
  }

  async deleteCandidateCV(id: string) {
    return this.documentService.delete(id);
  }
}
