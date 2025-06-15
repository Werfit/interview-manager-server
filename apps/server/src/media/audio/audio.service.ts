import { rm } from 'node:fs/promises';

import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { AttachmentType } from '@prisma/client';
import { fileManager } from 'apps/server/shared/helpers/file-manager.helper';
import { Queue } from 'bullmq';

import { AUDIO_QUEUE_NAME } from './audio.constants';
import { CleanupAudioDto } from './dto/cleanup-audio.dto';
import { CreateAudioFromVideoDto } from './dto/create-audio-from-video.dto';
import { AudioJobData } from './processors/audio.processor';

@Injectable()
export class AudioService {
  private readonly logger = new Logger(AudioService.name);
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    @InjectQueue(AUDIO_QUEUE_NAME)
    private readonly audioQueue: Queue<AudioJobData>,
  ) {}

  async cleanup(data: CleanupAudioDto) {
    this.logger.log('AudioService::cleanup', data);

    const exists = await fileManager.fileExists(data.url);

    if (exists) {
      await rm(data.url, { force: true });
    }
  }

  // TODO: Should create a database record for the audio
  async createFromVideo(data: CreateAudioFromVideoDto) {
    this.logger.log('AudioService::createFromVideo', data);

    if (data.audioId) {
      const audioExists = await this.txHost.tx.attachment.findUnique({
        where: { id: data.audioId, type: AttachmentType.AUDIO },
        select: {
          id: true,
        },
      });

      if (!audioExists) {
        this.logger.error(
          `AudioService::createFromVideo - Audio with id ${data.audioId} does not exist`,
        );
        return;
      }

      return;
    }

    return this.audioQueue.add(AUDIO_QUEUE_NAME, {
      videoUrl: data.videoUrl,
      videoId: data.metadata.videoId,
      recordingId: data.metadata.recordingId,
    });
  }
}
