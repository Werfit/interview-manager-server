import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Attachment, AttachmentType, Interview } from '@prisma/client';
import { FileManagerService } from 'src/file-uploader/services/file-manager.service';
import { tryCatch } from 'src/shared/utilities/try-catch/try-catch.utility';

import { FinalizeRecordingDto } from './dto/finalize-recording.dto';

@Injectable()
export class RecordingService {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    private readonly fileUploaderService: FileManagerService,
  ) {}

  async finalizeUpload(body: FinalizeRecordingDto) {
    const [success, data] = await tryCatch(async () => {
      const chunks = await this.fileUploaderService.getSessionChunks(
        body.sessionId,
      );

      const mergedPath = await this.fileUploaderService.mergeChunks({
        sessionId: body.sessionId,
        chunks,
      });

      return mergedPath;
    });

    if (!success) {
      throw new InternalServerErrorException(
        'Failed to finalize the video upload',
      );
    }

    const recording = await this.createRecording({
      url: data,
      interviewId: body.interviewId,
    });

    await Promise.all([
      this.fileUploaderService.startThumbnailGeneration({
        filepath: data,
        videoId: recording.id,
      }),
      this.fileUploaderService.startVideoConversion({
        filepath: data,
        videoId: recording.id,
      }),
    ]);
  }

  async deleteRecording(id: string) {
    const recording = await this.txHost.tx.attachment.findUnique({
      where: { id },
    });

    if (!recording) {
      throw new NotFoundException('Recording not found');
    }

    await this.fileUploaderService.deleteRecording(recording.url);
    return this.txHost.tx.attachment.delete({
      where: { id },
    });
  }

  async createRecording(
    createRecordingDto: Pick<Attachment, 'url' | 'interviewId'>,
  ) {
    return this.txHost.tx.attachment.create({
      data: {
        url: createRecordingDto.url,
        interviewId: createRecordingDto.interviewId,
        type: AttachmentType.VIDEO,
      },
    });
  }

  async getRecordings(
    data: Pick<Attachment, 'interviewId'> & Pick<Interview, 'organizationId'>,
  ) {
    const result = this.txHost.tx.attachment.findMany({
      where: {
        interviewId: data.interviewId,
        interview: {
          organizationId: data.organizationId,
        },
      },
      include: {
        thumbnail: {
          select: {
            url: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return result;
  }
}
