import { IsNotEmpty, IsString } from 'class-validator';

export class CombineVideoDto {
  @IsNotEmpty()
  @IsString()
  sessionId: string;
}
