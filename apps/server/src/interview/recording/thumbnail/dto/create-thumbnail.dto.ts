import { IsNotEmpty, IsString } from 'class-validator';

export class CreateThumbnailDto {
  @IsNotEmpty()
  @IsString()
  url: string;
}
