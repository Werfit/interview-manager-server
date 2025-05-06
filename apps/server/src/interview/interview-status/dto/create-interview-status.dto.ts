import { IsNotEmpty, IsString } from 'class-validator';

export class CreateInterviewStatusRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;
}
