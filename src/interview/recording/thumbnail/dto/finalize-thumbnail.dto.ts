import { IsString } from 'class-validator';

export class FinalizeThumbnailDto {
  @IsString()
  attachmentUrl: string;

  @IsString()
  thumbnailId: string;
}
