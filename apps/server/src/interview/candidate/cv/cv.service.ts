import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  Candidate,
  CandidateCV,
  CandidateCVStatus,
  Interview,
} from '@prisma/client';
import { DocumentService } from 'apps/server/media/document/document.service';
import { Queue } from 'bullmq';
import { EmbeddingDatabaseService } from 'libs/embedding-database';
import { tryCatch } from 'utilities/try-catch/try-catch.utility';

import { CV_QUEUE_NAME } from './cv.constants';
import { CVJobData } from './processors/cv.processor';

@Injectable()
export class CvService {
  private readonly logger = new Logger(CvService.name);
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    private readonly documentService: DocumentService,
    private readonly embeddingDatabaseService: EmbeddingDatabaseService,
    @InjectQueue(CV_QUEUE_NAME) private readonly cvQueue: Queue<CVJobData>,
  ) {}

  @Transactional()
  async uploadCv(data: {
    url: string;
    candidateId: Candidate['id'];
    interviewId: Interview['id'];
  }) {
    this.logger.log(`CvService::uploadCv:${data.candidateId}`);
    const cvExists = await this.txHost.tx.candidateCV.findUnique({
      where: { candidateId: data.candidateId },
    });

    if (cvExists) {
      throw new BadRequestException('CV already exists');
    }

    const attachment = await this.documentService.create({
      url: data.url,
    });

    const cv = await this.txHost.tx.candidateCV.create({
      data: {
        candidateId: data.candidateId,
        attachmentId: attachment.id,
      },
    });

    this.cvQueue.add(CV_QUEUE_NAME, {
      candidateId: data.candidateId,
      url: attachment.url,
      cvId: cv.id,
      interviewId: data.interviewId,
    });
    return cv;
  }

  async reprocessCv(
    data: Pick<CandidateCV, 'id'> & { interviewId: Interview['id'] },
  ) {
    this.logger.log(`CvService::reprocessCv:${data.id}`);

    const cv = await this.txHost.tx.candidateCV.findUnique({
      where: { id: data.id },
      select: {
        candidateId: true,
        id: true,
        attachment: {
          select: {
            url: true,
          },
        },
        status: true,
      },
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    const [success] = await tryCatch(() =>
      this.embeddingDatabaseService.deleteEmbeddings({
        where: {
          cvId: data.id,
        },
      }),
    );

    if (!success) {
      throw new InternalServerErrorException(
        'Failed to clean up CV older information',
      );
    }

    this.cvQueue.add(CV_QUEUE_NAME, {
      candidateId: cv.candidateId,
      url: cv.attachment.url,
      cvId: cv.id,
      interviewId: data.interviewId,
    });
  }

  async finalizeCv(cvId: string) {
    await this.txHost.tx.candidateCV.update({
      where: { id: cvId },
      data: { status: CandidateCVStatus.EMBEDDED },
    });
  }

  @Transactional()
  async deleteCv(id: string) {
    this.logger.log(`CvService::deleteCv:${id}`);
    const cv = await this.txHost.tx.candidateCV.findUnique({
      where: { candidateId: id },
    });

    if (!cv) {
      throw new BadRequestException('CV not found');
    }

    await this.txHost.tx.candidateCV.delete({
      where: { id: cv.id },
    });
    await this.documentService.delete(cv.attachmentId);
  }
}
