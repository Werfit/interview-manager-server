import { IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { IsString } from 'class-validator';

export class CreateAudioFromVideoMetadataDto {
  @IsNotEmpty()
  @IsString()
  videoId: string;

  @IsNotEmpty()
  @IsString()
  recordingId: string;
}

export class CreateAudioFromVideoDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  audioId?: string;

  @IsNotEmpty()
  @IsString()
  videoUrl: string;

  @IsNotEmpty()
  @IsObject()
  metadata: CreateAudioFromVideoMetadataDto;
}
