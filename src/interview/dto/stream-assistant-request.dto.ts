import { IsString } from 'class-validator';

export class StreamAssistantRequestDto {
  @IsString()
  content: string;
}
