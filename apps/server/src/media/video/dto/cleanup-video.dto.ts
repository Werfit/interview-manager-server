import { IsNotEmpty, IsString } from 'class-validator';

export class CleanupVideoDto {
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @IsNotEmpty()
  @IsString()
  url: string;
}
