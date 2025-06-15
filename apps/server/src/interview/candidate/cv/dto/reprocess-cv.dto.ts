import { IsNotEmpty, IsString } from 'class-validator';

export class ReprocessCvDto {
  @IsString()
  @IsNotEmpty()
  interviewId: string;
}
