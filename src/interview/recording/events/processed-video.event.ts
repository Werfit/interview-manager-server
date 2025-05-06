type ProcessedRecordingMetadata = {
  recordingId: string;
  interviewId: string;
};

export class ProcessedRecordingEvent {
  constructor(
    public readonly recordingUrl: string,
    public readonly metadata: ProcessedRecordingMetadata,
  ) {}
}
