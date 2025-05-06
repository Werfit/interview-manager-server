import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AccessTokenGuard } from 'apps/server/authentication/guards/access-token.guard';
import {
  OrganizationUser,
  UserOrganizationGuard,
} from 'apps/server/authentication/guards/user-organization.guard';
import { User } from 'apps/server/shared/decorators/user.decorator';
import { FileChunksInterceptor } from 'apps/server/shared/interceptors/file-chunks.interceptor';

import { FinalizeRecordingDto } from './dto/finalize-recording.dto';
import { GetRecordingsQueryDto } from './dto/get-recordings-query.dto';
import { RecordingService } from './recording.service';

@Controller('interviews/recordings')
@UseGuards(AccessTokenGuard, UserOrganizationGuard)
export class RecordingController {
  constructor(private readonly recordingService: RecordingService) {}

  @Post('upload-chunk')
  @UseInterceptors(FileChunksInterceptor('chunk'))
  uploadChunk(@UploadedFile() file: Express.Multer.File) {
    return { message: 'Chunk uploaded successfully', file: file.filename };
  }

  @Post('finalize-upload')
  async finalizeUpload(@Body() body: FinalizeRecordingDto) {
    await this.recordingService.finalizeUpload(body);
    return { message: 'Finalization started' };
  }

  @Get('list')
  async getRecordings(
    @Query() query: GetRecordingsQueryDto,
    @User() user: OrganizationUser,
  ) {
    return this.recordingService.getRecordings({
      interviewId: query.interviewId,
      organizationId: user.organizationId,
    });
  }

  @Get(':id')
  async getRecording(@Param('id') id: string) {
    return this.recordingService.getRecording({ id });
  }

  @Delete(':id')
  async deleteRecording(@Param('id') id: string) {
    return this.recordingService.deleteRecording(id);
  }

  // @Post(':id/generate-transcription')
  // async generateTranscription(@Param('id') id: string) {
  //   const recording = await this.recordingService.getRecording({ id });

  //   if (!recording || !recording.interviewId) {
  //     throw new NotFoundException('Recording not found');
  //   }

  //   await this.audioService.createFromVideo({
  //     videoUrl: recording.url,
  //     metadata: {
  //       videoId: recording.id,
  //       interviewId: recording.interviewId,
  //     },
  //   });

  //   return { message: 'Transcription generation started' };
  // }
}
