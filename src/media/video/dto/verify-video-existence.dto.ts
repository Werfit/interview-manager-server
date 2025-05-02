import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { IsString } from 'class-validator';

export class VerifyVideoExistenceDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsBoolean()
  @IsOptional()
  fileMustExist?: boolean;
}
