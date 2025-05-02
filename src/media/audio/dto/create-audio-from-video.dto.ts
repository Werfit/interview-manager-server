import { IsNotEmpty, IsObject } from 'class-validator';
import { IsString } from 'class-validator';

export class CreateAudioFromVideoMetadataDto {
  @IsNotEmpty()
  @IsString()
  videoId: string;

  @IsNotEmpty()
  @IsString()
  interviewId: string;
}

export class CreateAudioFromVideoDto {
  @IsNotEmpty()
  @IsString()
  videoUrl: string;

  @IsNotEmpty()
  @IsObject()
  metadata: CreateAudioFromVideoMetadataDto;
}
