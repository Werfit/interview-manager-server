import { IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

export class DeleteVideoDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
