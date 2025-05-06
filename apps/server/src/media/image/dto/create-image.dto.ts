import { AttachmentStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateImageDto {
  @IsString()
  url: string;

  @IsEnum(AttachmentStatus)
  @IsOptional()
  status?: AttachmentStatus;
}
