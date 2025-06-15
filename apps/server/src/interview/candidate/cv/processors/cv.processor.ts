import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { fileManager } from 'apps/server/shared/helpers/file-manager.helper';
import { Job } from 'bullmq';
import { EmbeddingService } from 'libs/embedding';
import { EmbeddingDatabaseService } from 'libs/embedding-database';

import { CV_QUEUE_NAME } from '../cv.constants';
import { CvService } from '../cv.service';

export type CVJobData = {
  url: string;
  cvId: string;
  candidateId: string;
  interviewId: string;
};

@Processor(CV_QUEUE_NAME)
export class CVProcessor extends WorkerHost {
  private readonly logger = new Logger(CVProcessor.name);
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly embeddingDatabaseService: EmbeddingDatabaseService,
    private readonly cvService: CvService,
  ) {
    super();
  }

  async process(job: Job<CVJobData>) {
    this.logger.log(`CVProcessor::process:${job.id}`);

    const { url, cvId, candidateId, interviewId } = job.data;

    const text = await fileManager.readPDFFile(url);

    if (!text) {
      throw new Error('Failed to read PDF file');
    }

    const embeddings = await this.embeddingService.embedText([text]);

    await this.embeddingDatabaseService.addEmbeddings({
      embeddings: [embeddings],
      documents: [text],
      metadatas: [
        {
          cvId,
          candidateId,
          interviewId,
        },
      ],
      // probably do not need to add date, needs verifying
      ids: [`${cvId}-${Date.now()}`],
    });

    await this.cvService.finalizeCv(cvId);
  }
}
