import { InjectQueue } from '@nestjs/bullmq';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Queue } from 'bullmq';
import { ThumbnailService } from 'src/interview/recording/thumbnail/thumbnail.service';

import { ProcessRecordingCommand } from '../commands/process-recording.command';
import { RECORDING_QUEUE_NAME } from '../recording.constants';
import { RecordingJobData } from '../recording.processor';

@CommandHandler(ProcessRecordingCommand)
export class ProcessRecordingHandler
  implements ICommandHandler<ProcessRecordingCommand>
{
  constructor(
    @InjectQueue(RECORDING_QUEUE_NAME)
    private readonly recordingQueue: Queue<RecordingJobData>,
    private readonly thumbnailService: ThumbnailService,
  ) {}

  async execute(command: ProcessRecordingCommand) {
    await Promise.all([
      this.thumbnailService.startThumbnailGeneration({
        url: command.attachmentUrl,
        thumbnailId: command.metadata.thumbnailId,
      }),
      this.recordingQueue.add(RECORDING_QUEUE_NAME, {
        videoUrl: command.attachmentUrl,
        videoId: command.metadata.videoId,
        recordingId: command.metadata.recordingId,
      }),
    ]);
  }
}
