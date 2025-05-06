import { IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

export class AskDto {
  @IsString()
  @IsNotEmpty()
  userInput: string;

  @IsString()
  @IsNotEmpty()
  interviewId: string;
}
