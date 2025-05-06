import { IsString } from 'class-validator';

export class StartThumbnailGenerationDto {
  @IsString()
  thumbnailId: string;

  @IsString()
  url: string;
}
