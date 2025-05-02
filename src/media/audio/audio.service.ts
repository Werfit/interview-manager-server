import { rm } from 'node:fs/promises';

import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { fileManager } from 'src/shared/helpers/file-manager.helper';

import { AUDIO_QUEUE_NAME } from './audio.constants';
import { AudioJobData } from './audio.processor';
import { CleanupAudioDto } from './dto/cleanup-audio.dto';
import { CreateAudioFromVideoDto } from './dto/create-audio-from-video.dto';

@Injectable()
export class AudioService {
  private readonly logger = new Logger(AudioService.name);
  constructor(
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

    return this.audioQueue.add(AUDIO_QUEUE_NAME, {
      videoUrl: data.videoUrl,
      videoId: data.metadata.videoId,
      interviewId: data.metadata.interviewId,
    });
  }
}
