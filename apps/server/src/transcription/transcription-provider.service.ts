import { PathLike } from 'node:fs';

import { Injectable } from '@nestjs/common';

import { OpenaiProvider } from './providers/openai.provider';
import {
  ITranscriptionProvider,
  ITranscriptionResult,
} from './providers/providers.types';
import { WhisperProvider } from './providers/whisper.provider';

const Providers = {
  whisper: WhisperProvider,
  openai: OpenaiProvider,
} as const;

type TranscriptionProviderConfig = {
  provider: keyof typeof Providers;
  url: string;
  model: string;
};

@Injectable()
export class TranscriptionProvider implements ITranscriptionProvider {
  private readonly provider: ITranscriptionProvider;

  constructor(config: TranscriptionProviderConfig) {
    const Provider = Providers[config.provider];

    if (!Provider) {
      throw new Error(`Provider ${config.provider} not found`);
    }

    this.provider = new Provider(config);
  }

  async transcribe(
    audioUrl: string | PathLike,
  ): Promise<ITranscriptionResult | null> {
    return this.provider.transcribe(audioUrl);
  }
}
