import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteDocumentDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
