import { IsNotEmpty, IsString } from 'class-validator';

export class CleanupAudioDto {
  @IsNotEmpty()
  @IsString()
  url: string;
}
