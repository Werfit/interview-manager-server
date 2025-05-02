import { Command } from '@nestjs/cqrs';

type ProcessVideoCommandMetadata = {
  videoId: string;
  interviewId: string;
};

export class ProcessVideoCommand extends Command<void> {
  constructor(
    public readonly metadata: ProcessVideoCommandMetadata,
    public readonly videoUrl: string,
  ) {
    super();
  }
}
