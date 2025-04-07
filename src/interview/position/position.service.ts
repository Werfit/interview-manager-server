import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { InterviewPosition } from '@prisma/client';

@Injectable()
export class PositionService {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async getPositions(data: Pick<InterviewPosition, 'organizationId'>) {
    return this.txHost.tx.interviewPosition.findMany({
      where: { organizationId: data.organizationId },
    });
  }

  async createPosition(
    data: Pick<InterviewPosition, 'organizationId' | 'name'>,
  ) {
    return this.txHost.tx.interviewPosition.create({
      data,
    });
  }

  async updatePosition(
    data: Pick<InterviewPosition, 'organizationId' | 'id' | 'name'>,
  ) {
    return this.txHost.tx.interviewPosition.update({
      where: { id: data.id },
      data,
    });
  }

  async deletePosition(data: Pick<InterviewPosition, 'organizationId' | 'id'>) {
    return this.txHost.tx.interviewPosition.delete({
      where: { id: data.id },
    });
  }
}
