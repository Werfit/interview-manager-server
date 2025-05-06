import { IsNotEmpty, IsUUID } from 'class-validator';

import { IsString } from 'class-validator';

export class FinalizeRecordingDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  interviewId: string;
}
