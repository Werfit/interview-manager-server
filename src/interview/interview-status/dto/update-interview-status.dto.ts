import { IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

export class UpdateInterviewStatusRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;
}
