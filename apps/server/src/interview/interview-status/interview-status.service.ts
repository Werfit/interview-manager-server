import { Injectable, Logger } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { InterviewStatus } from '@prisma/client';
import { tryCatch } from 'shared/utilities/try-catch/try-catch.utility';

import { CreateInterviewStatusRequestDto } from './dto/create-interview-status.dto';
import { UpdateInterviewStatusRequestDto } from './dto/update-interview-status.dto';

@Injectable()
export class InterviewStatusService {
  private readonly logger = new Logger(InterviewStatusService.name);

  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async findInterviewStatusById(data: Pick<InterviewStatus, 'id'>) {
    const [interviewStatusFindSuccess, interviewStatus] = await tryCatch(() =>
      this.txHost.tx.interviewStatus.findUnique({
        where: { id: data.id },
      }),
    );

    return interviewStatusFindSuccess ? interviewStatus : null;
  }

  async getInterviewStatuses({
    organizationId,
  }: Pick<InterviewStatus, 'organizationId'>) {
    return this.txHost.tx.interviewStatus.findMany({
      where: { organizationId },
      include: {
        nextStatus: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async createInterviewStatus(
    data: CreateInterviewStatusRequestDto &
      Pick<InterviewStatus, 'organizationId'>,
  ) {
    return this.txHost.tx.interviewStatus.create({
      data,
    });
  }

  async updateInterviewStatus(
    data: UpdateInterviewStatusRequestDto &
      Pick<InterviewStatus, 'organizationId' | 'id'>,
  ) {
    return this.txHost.tx.interviewStatus.update({
      where: { id: data.id },
      data,
    });
  }

  async deleteInterviewStatus(
    data: Pick<InterviewStatus, 'organizationId' | 'id'>,
  ) {
    return this.txHost.tx.interviewStatus.delete({
      where: { id: data.id },
    });
  }

  async createDefaultInterviewStatuses({
    organizationId,
  }: Pick<InterviewStatus, 'organizationId'>) {
    this.logger.debug(
      'InterviewStatusService::createDefaultInterviewStatuses',
      {
        organizationId,
      },
    );

    const statuses = [
      {
        name: 'HR',
        description:
          'Initial interview with HR to discuss the role, company culture, and basic qualifications',
      },
      {
        name: 'Technical',
        description:
          'Technical interview with the technical team to discuss the technical skills and experience',
      },
      {
        name: 'Accepted',
        description: 'Candidate has been accepted',
      },
      {
        name: 'Rejected',
        description: 'Candidate has been rejected',
      },
    ];

    const exists = await this.txHost.tx.interviewStatus.count({
      where: {
        organizationId,
        name: {
          in: statuses.map((status) => status.name),
        },
      },
    });

    // if all statuses already exist, return
    if (exists > statuses.length) {
      return;
    }

    await this.txHost.tx.interviewStatus.createMany({
      data: statuses.map((status) => ({
        name: status.name,
        description: status.description,
        organizationId,
      })),
    });
  }
}
