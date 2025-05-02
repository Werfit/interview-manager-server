import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { SegmentDTO } from './embedding.dto';

export class TranscriptionReadyDto {
  @IsString()
  @IsNotEmpty()
  interviewId: string;

  @IsString()
  @IsNotEmpty()
  audioPath: string;

  @IsString()
  @IsNotEmpty()
  attachmentId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SegmentDTO)
  segments: SegmentDTO[];

  @IsString()
  @IsOptional()
  language: string;

  @IsNumber()
  @IsOptional()
  duration: number;

  @IsString()
  transcriptionId: string;
}
