import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePositionRequestDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
