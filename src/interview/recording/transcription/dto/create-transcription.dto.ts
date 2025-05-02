import { TranscriptionStatus } from '@prisma/client';
import { IsEnum, IsString, IsUUID } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

export class CreateTranscriptionDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  interviewId: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  recordingId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(TranscriptionStatus)
  status?: TranscriptionStatus;
}
