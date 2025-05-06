import { PathLike } from 'node:fs';

import { Logger } from '@nestjs/common';
import axios from 'axios';
import { tryCatch } from 'src/shared/utilities/try-catch/try-catch.utility';

import { BaseTranscriptionProvider } from './base.provider';
import {
  ITranscriptionProvider,
  ITranscriptionResult,
  ITranscriptionSegment,
} from './providers.types';

type WhisperResponse = {
  segments: ITranscriptionSegment[];
  text: string;
};

export class WhisperProvider
  extends BaseTranscriptionProvider
  implements ITranscriptionProvider
{
  private readonly logger = new Logger(WhisperProvider.name);

  async transcribe(
    audioPath: string | PathLike,
  ): Promise<ITranscriptionResult | null> {
    const [success, data] = await tryCatch<WhisperResponse>(async () => {
      const response = await axios.post<WhisperResponse>(this.config.url, {
        model: this.config.model,
        audioURL: audioPath,
      });

      return response.data;
    });

    if (!success) {
      this.logger.error('Whisper transcription failed', data);
      return null;
    }

    return data;
  }
}
