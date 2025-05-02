import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Attachment, Interview } from '@prisma/client';
import { ProcessVideoCommand } from 'src/media/video/commands/process-video.command';
import { VideoService } from 'src/media/video/video.service';
import { tryCatch } from 'src/shared/utilities/try-catch/try-catch.utility';

import { CreateRecordingDto } from './dto/create-recording.dto';
import { FinalizeRecordingDto } from './dto/finalize-recording.dto';

@Injectable()
export class RecordingService {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,

    private readonly videoService: VideoService,
    private readonly commandBus: CommandBus,
  ) {}

  async finalizeUpload(body: FinalizeRecordingDto) {
    const [success, response] = await tryCatch(async () =>
      this.videoService.combine({
        sessionId: body.sessionId,
      }),
    );

    if (!success) {
      throw response;
    }

    const recordingUrl = response;

    const recording = await this.createRecording({
      url: recordingUrl,
      interviewId: body.interviewId,
    });

    if (!recording) {
      throw new InternalServerErrorException('Failed to create recording');
    }

    await this.commandBus.execute(
      new ProcessVideoCommand(
        {
          videoId: recording.id,
          interviewId: body.interviewId,
        },
        recordingUrl,
      ),
    );
  }

  async deleteRecording(id: string) {
    return this.videoService.delete({
      id,
    });
  }

  async createRecording(data: CreateRecordingDto) {
    return this.videoService.create(data);
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

  async getRecording(data: Pick<Attachment, 'id'>) {
    return this.videoService.find({
      id: data.id,
    });
  }
}
