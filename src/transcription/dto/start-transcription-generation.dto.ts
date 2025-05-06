import { IsNotEmpty, IsString } from 'class-validator';

export class StartTranscriptionGenerationDto {
  @IsString()
  @IsNotEmpty()
  audioUrl: string;

  @IsString()
  @IsNotEmpty()
  transcriptionId: string;
}
