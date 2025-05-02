import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ThumbnailService } from 'src/media/thumbnail/thumbnail.service';

import { ProcessVideoCommand } from '../commands/process-video.command';
import { VideoService } from '../video.service';

@CommandHandler(ProcessVideoCommand)
export class ProcessVideoHandler
  implements ICommandHandler<ProcessVideoCommand>
{
  constructor(
    private readonly videoService: VideoService,
    private readonly thumbnailService: ThumbnailService,
  ) {}

  async execute(command: ProcessVideoCommand) {
    await Promise.all([
      this.thumbnailService.startThumbnailGeneration({
        url: command.videoUrl,
        videoId: command.metadata.videoId,
      }),
      this.videoService.startConversionToMp4({
        videoUrl: command.videoUrl,
        metadata: {
          videoId: command.metadata.videoId,
          interviewId: command.metadata.interviewId,
        },
      }),
    ]);
  }
}
