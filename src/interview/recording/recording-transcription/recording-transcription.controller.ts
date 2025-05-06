import { Controller, Get, Param } from '@nestjs/common';

import { RecordingTranscriptionService } from './recording-transcription.service';

@Controller('interviews/recordings/:recordingId/transcriptions')
export class RecordingTranscriptionController {
  constructor(
    private readonly transcriptionService: RecordingTranscriptionService,
  ) {}

  @Get()
  async getTranscription(@Param('recordingId') recordingId: string) {
    return this.transcriptionService.getTranscription(recordingId);
  }
}
