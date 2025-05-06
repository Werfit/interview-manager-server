import { IsString } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  url: string;

  @IsString()
  candidateId: string;
}
