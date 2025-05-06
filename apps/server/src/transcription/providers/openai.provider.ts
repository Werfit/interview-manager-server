import { PathLike } from 'node:fs';

import { BaseTranscriptionProvider } from './base.provider';
import {
  ITranscriptionProvider,
  ITranscriptionResult,
} from './providers.types';

export class OpenaiProvider
  extends BaseTranscriptionProvider
  implements ITranscriptionProvider
{
  transcribe(
    _audioPath: string | PathLike,
  ): Promise<ITranscriptionResult | null> {
    // TODO: Implement OpenAI API call
    throw new Error('OpenAI implementation pending configuration details');
  }
}
