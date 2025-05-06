import { ITranscriptionSegment } from '../providers/providers.types';

type AudioTranscribedEventMetadata = {
  transcriptionId: string;
  segments: ITranscriptionSegment[];
};

export class AudioTranscribedEvent {
  constructor(
    public readonly text: string,
    public readonly metadata: AudioTranscribedEventMetadata,
  ) {}
}
