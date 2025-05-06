import { PathLike } from 'node:fs';

import {
  ITranscriptionProvider,
  ITranscriptionResult,
} from './providers.types';

type Config = {
  url: string;
  model: string;
};

export abstract class BaseTranscriptionProvider
  implements ITranscriptionProvider
{
  protected readonly config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  abstract transcribe(
    audioPath: string | PathLike,
  ): Promise<ITranscriptionResult | null>;
}
