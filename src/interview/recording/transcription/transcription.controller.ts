import { Controller, Get, Param } from '@nestjs/common';

import { TranscriptionService } from './transcription.service';

@Controller('interviews/recordings/:recordingId/transcriptions')
export class TranscriptionController {
  constructor(private readonly transcriptionService: TranscriptionService) {}

  @Get()
  async getTranscription(@Param('recordingId') recordingId: string) {
    return this.transcriptionService.getTranscription(recordingId);
  }
}
