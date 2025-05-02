import { IsNotEmpty, IsString } from 'class-validator';

export class SendNewMessageDto {
  @IsString()
  @IsNotEmpty()
  interviewId: string;

  @IsString()
  @IsNotEmpty()
  userInput: string;
}
