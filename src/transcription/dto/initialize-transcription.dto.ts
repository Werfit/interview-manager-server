import { IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

export class InitializeTranscriptionDto {
  @IsNotEmpty()
  @IsString()
  recordingId: string;
}
