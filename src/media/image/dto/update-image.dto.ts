import { AttachmentStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateImageDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsEnum(AttachmentStatus)
  status?: AttachmentStatus;
}
