import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

import { StartTranscriptionGenerationDto } from './dto/start-transcription-generation.dto';
import { TRANSCRIPTION_QUEUE_NAME } from './transcription.constants';
import { TranscriptionJobData } from './transcription.processor';

@Injectable()
export class TranscriptionService {
  constructor(
    @InjectQueue(TRANSCRIPTION_QUEUE_NAME)
    private readonly queue: Queue<TranscriptionJobData>,
  ) {}

  async startTranscriptionGeneration(data: StartTranscriptionGenerationDto) {
    return this.queue.add(TRANSCRIPTION_QUEUE_NAME, {
      audioUrl: data.audioUrl,
      metadata: {
        transcriptionId: data.transcriptionId,
      },
    });
  }
}
