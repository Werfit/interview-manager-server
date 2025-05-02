type ProcessedVideoMetadata = {
  videoId: string;
  interviewId: string;
};

export class ProcessedVideoEvent {
  constructor(
    public readonly videoUrl: string,
    public readonly metadata: ProcessedVideoMetadata,
  ) {}
}
