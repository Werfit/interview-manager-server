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
import { AccessTokenGuard } from 'src/authentication/guards/access-token.guard';
import {
  OrganizationUser,
  UserOrganizationGuard,
} from 'src/authentication/guards/user-organization.guard';
import { FileChunksInterceptor } from 'src/file-uploader/interceptors/file-chunks.interceptor';
import { User } from 'src/shared/decorators/user.decorator';

import { FinalizeRecordingDto } from './dto/finalize-recording.dto';
import { GetRecordingsQueryDto } from './dto/get-recordings-query.dto';
import { RecordingService } from './recording.service';

@Controller('interviews/recordings')
@UseGuards(AccessTokenGuard, UserOrganizationGuard)
export class RecordingController {
  constructor(private readonly recordingService: RecordingService) {}

  @Post('upload-chunk')
  @UseInterceptors(FileChunksInterceptor('chunk', '.webm'))
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

  @Delete(':id')
  async deleteRecording(@Param('id') id: string) {
    return this.recordingService.deleteRecording(id);
  }
}
