import { Injectable, Logger } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Prisma } from '@prisma/client';
import { tryCatch } from 'src/shared/utilities/try-catch/try-catch.utility';

@Injectable()
export class CandidateService {
  private readonly logger = new Logger(CandidateService.name);

  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
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
}
