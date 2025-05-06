type ExtractedAudioEventMetadata = {
  recordingId: string;
  attachmentId: string;
};

export class ExtractedAudioEvent {
  constructor(
    public readonly audioUrl: string,
    public readonly metadata: ExtractedAudioEventMetadata,
  ) {}
}
