type AudioTranscriptionFailedEventMetadata = {
  transcriptionId: string;
};

export class AudioTranscriptionFailedEvent {
  constructor(
    public readonly metadata: AudioTranscriptionFailedEventMetadata,
  ) {}
}
