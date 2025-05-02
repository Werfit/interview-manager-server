import { SegmentDTO } from '../dto/embedding.dto';

type StartEmbeddingMetadata = {
  interviewId: string;
  recordingId: string;
};

export class StartEmbeddingEvent {
  constructor(
    public readonly segments: SegmentDTO[],
    public readonly metadata: StartEmbeddingMetadata,
  ) {}
}
