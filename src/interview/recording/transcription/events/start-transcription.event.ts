type StartTranscriptionMetadata = {
  attachmentId: string;
  interviewId: string;
};

export class StartTranscriptionEvent {
  constructor(
    public readonly audioPath: string,
    public readonly metadata: StartTranscriptionMetadata,
  ) {}
}
