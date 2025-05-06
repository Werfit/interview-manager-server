import { Injectable, Logger } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { tryCatch } from 'src/shared/utilities/try-catch/try-catch.utility';

import { CreateTranscriptionDto } from './dto/create-transcription.dto';
import { UpdateTranscriptionDto } from './dto/update-transcription.dto';

@Injectable()
export class RecordingTranscriptionService {
  private readonly logger = new Logger(RecordingTranscriptionService.name);

  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async getTranscription(recordingId: string) {
    return this.txHost.tx.transcription.findFirst({
      where: { recordingId },
    });
  }

  async createTranscription(createTranscriptionDto: CreateTranscriptionDto) {
    this.logger.log('Creating transcription', createTranscriptionDto);

    const [success, data] = await tryCatch(() =>
      this.txHost.tx.transcription.create({
        data: {
          recordingId: createTranscriptionDto.recordingId,
          content: createTranscriptionDto.content,
          status: createTranscriptionDto.status,
        },
      }),
    );

    if (!success) {
      return null;
    }

    return data;
  }

  async updateTranscription(
    transcriptionId: string,
    updateTranscriptionDto: UpdateTranscriptionDto,
  ) {
    const [success, data] = await tryCatch(() =>
      this.txHost.tx.transcription.update({
        where: { id: transcriptionId },
        data: updateTranscriptionDto,
        include: {
          recording: {
            select: {
              interviewId: true,
            },
          },
        },
      }),
    );

    if (!success) {
      this.logger.error(`Failed to update transcription for interview ${data}`);

      return null;
    }

    return data;
  }
}
