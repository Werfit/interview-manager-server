import { IsString } from 'class-validator';

export class GetMessagesDto {
  @IsString()
  interviewId: string;
}
