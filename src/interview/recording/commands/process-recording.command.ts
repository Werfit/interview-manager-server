import { Command } from '@nestjs/cqrs';

type ProcessRecordingCommandMetadata = {
  thumbnailId: string;
  videoId: string;
  recordingId: string;
};

export class ProcessRecordingCommand extends Command<void> {
  constructor(
    public readonly metadata: ProcessRecordingCommandMetadata,
    public readonly attachmentUrl: string,
  ) {
    super();
  }
}
