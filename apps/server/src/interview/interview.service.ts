import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Interview, Organization } from '@prisma/client';

import { CandidateService } from './candidate/candidate.service';
import { CvService } from './candidate/cv/cv.service';
import { CreateInterviewRequestDto } from './dto/create-interview-request.dto';
import { InterviewStatusService } from './interview-status/interview-status.service';
@Injectable()
export class InterviewService {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    private readonly candidateService: CandidateService,
    private readonly interviewStatusService: InterviewStatusService,
    private readonly cvService: CvService,
  ) {}

  @Transactional()
  async createInterview(
    data: CreateInterviewRequestDto & {
      organizationId: Organization['id'];
      cvPath?: string;
    },
  ) {
    const status = await this.interviewStatusService.findInterviewStatusById({
      id: data.statusId,
    });

    if (!status) {
      throw new NotFoundException('Interview status not found');
    }

    const candidate = await this.candidateService.createCandidate({
      name: data.name,
      email: data.email,
      phone: data.phone,
    });

    if (!candidate) {
      throw new InternalServerErrorException('Error creating candidate');
    }

    if (data.cvPath) {
      await this.cvService.uploadCv({
        url: data.cvPath,
        candidateId: candidate.id,
      });
    }

    const interview = await this.txHost.tx.interview.create({
      data: {
        interviewerId: data.interviewerId,
        organizationId: data.organizationId,
        statusId: status.id,
        candidateId: candidate.id,
        date: data.datetime,
        description: data.description,
        positionId: data.positionId,
      },
    });

    return interview;
  }

  async getInterview(data: Pick<Interview, 'id' | 'organizationId'>) {
    return this.txHost.tx.interview.findUnique({
      where: { id: data.id, organizationId: data.organizationId },
      include: {
        interviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },

        status: true,
        position: true,
      },
    });
  }

  async getInterviews(organizationId: Organization['id']) {
    return this.txHost.tx.interview.findMany({
      where: {
        organizationId,
      },
      include: {
        interviewer: {
          omit: {
            password: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        candidate: {
          omit: {
            createdAt: true,
            updatedAt: true,
          },
        },
        status: {
          omit: {
            createdAt: true,
            updatedAt: true,
          },
        },
        position: {
          omit: {
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }
}
