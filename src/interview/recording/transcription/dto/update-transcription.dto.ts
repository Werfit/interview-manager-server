import { TranscriptionStatus } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class UpdateTranscriptionDto {
  @IsEnum(TranscriptionStatus)
  status?: TranscriptionStatus;

  @IsString()
  content: string;
}
