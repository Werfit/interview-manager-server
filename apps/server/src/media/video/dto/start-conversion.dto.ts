import { IsObject, IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

export class StartConversionMetadataDto {
  @IsNotEmpty()
  @IsString()
  videoId: string;

  @IsNotEmpty()
  @IsString()
  interviewId: string;
}

export class StartConversionToMp4Dto {
  @IsNotEmpty()
  @IsString()
  videoUrl: string;

  @IsNotEmpty()
  @IsObject()
  metadata: StartConversionMetadataDto;
}
