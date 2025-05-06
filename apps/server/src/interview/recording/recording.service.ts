import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  Attachment,
  Interview,
  InterviewRecordingStatus,
  Organization,
} from '@prisma/client';
import { ProcessRecordingCommand } from 'apps/server/interview/recording/commands/process-recording.command';
import { ImageService } from 'apps/server/media/image/image.service';
import { VideoService } from 'apps/server/media/video/video.service';
import { tryCatch } from 'shared/utilities/try-catch/try-catch.utility';

import { CreateRecordingDto } from './dto/create-recording.dto';
import { FinalizeRecordingDto } from './dto/finalize-recording.dto';
import { ThumbnailService } from './thumbnail/thumbnail.service';

@Injectable()
export class RecordingService {
  private readonly logger = new Logger(RecordingService.name);

  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,

    private readonly videoService: VideoService,
    private readonly imageService: ImageService,
    private readonly thumbnailService: ThumbnailService,
    private readonly commandBus: CommandBus,
  ) {}

  async finalizeUpload(body: FinalizeRecordingDto) {
    this.logger.log('RecordingService::finalizeUpload', body);

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
      new ProcessRecordingCommand(
        {
          videoId: recording.videoId,
          thumbnailId: recording.thumbnailId,
          recordingId: recording.id,
        },
        recordingUrl,
      ),
    );
  }

  async deleteRecording(id: string) {
    this.logger.log('RecordingService::deleteRecording', id);

    const [success, recording] = await tryCatch(async () => {
      const recording = await this.txHost.tx.interviewRecording.delete({
        where: {
          id,
        },
        select: {
          videoId: true,
          thumbnailId: true,
        },
      });

      if (!recording) {
        return null;
      }

      // TODO: Delete thumbnail

      await Promise.all([
        this.videoService.delete({
          id: recording.videoId,
        }),
        this.imageService.delete({
          id: recording.thumbnailId,
        }),
      ]);
    });

    if (!success) {
      this.logger.error(
        `RecordingService::deleteRecording - Failed to delete recording`,
        recording,
      );
      throw recording;
    }

    return recording;
  }

  @Transactional()
  async createRecording(data: CreateRecordingDto) {
    this.logger.log('RecordingService::createRecording', data);

    const [success, recording] = await tryCatch(async () => {
      const [video, thumbnail] = await Promise.all([
        this.videoService.create(data),
        this.thumbnailService.createThumbnail({
          url: data.url,
        }),
      ]);

      const recording = await this.txHost.tx.interviewRecording.create({
        data: {
          interviewId: data.interviewId,
          videoId: video.id,
          thumbnailId: thumbnail.id,
        },
      });

      return recording;
    });

    if (!success) {
      this.logger.error(
        `RecordingService::createRecording - Failed to create recording`,
        recording,
      );
      throw recording;
    }

    return recording;
  }

  async getRecordings(data: {
    interviewId: Interview['id'];
    organizationId: Organization['id'];
  }) {
    this.logger.log('RecordingService::getRecordings', data);
    const recordings = await this.txHost.tx.interviewRecording.findMany({
      where: {
        interviewId: data.interviewId,
        interview: {
          organizationId: data.organizationId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        thumbnail: {
          select: {
            status: true,
            url: true,
          },
        },
        video: {
          select: {
            status: true,
          },
        },
      },
    });

    return recordings;
  }

  async getRecording(data: Pick<Attachment, 'id'>) {
    return this.txHost.tx.interviewRecording.findUnique({
      where: {
        id: data.id,
      },
      include: {
        thumbnail: {
          select: {
            id: true,
            url: true,
            status: true,
          },
        },
        video: {
          select: {
            id: true,
            url: true,
            status: true,
          },
        },
      },
    });
  }

  /**
   * Sets the status of a recording to embedded, that means that recording information is ready to be used in prompting
   */
  async setEmbedded(recordingId: string) {
    const [success, recording] = await tryCatch(async () => {
      const recording = await this.txHost.tx.interviewRecording.update({
        where: { id: recordingId },
        data: { status: InterviewRecordingStatus.EMBEDDED },
      });

      return recording;
    });

    if (!success) {
      throw recording;
    }

    return recording;
  }
}
