import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRecordingDto {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsString()
  interviewId: string;
}
