import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePositionRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
