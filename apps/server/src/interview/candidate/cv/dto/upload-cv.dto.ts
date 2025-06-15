import { IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

export class UploadCvDto {
  @IsString()
  @IsNotEmpty()
  interviewId: string;
}
