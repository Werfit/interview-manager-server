import { IsUUID } from 'class-validator';

export class FindVideoDto {
  @IsUUID()
  id: string;
}
