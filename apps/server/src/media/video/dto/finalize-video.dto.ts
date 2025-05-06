import { IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

export class FinalizeVideoDto {
  @IsNotEmpty()
  @IsString()
  videoId: string;

  @IsNotEmpty()
  @IsString()
  url: string;
}
