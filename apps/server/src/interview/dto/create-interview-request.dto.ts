import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateInterviewRequestDto {
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  name: string;

  @Transform(({ value }: { value: string }) => value?.trim())
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Transform(({ value }: { value: string }) => value?.trim())
  @IsString()
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsDateString()
  @IsNotEmpty()
  datetime: Date;

  @IsUUID()
  statusId: string;

  @IsUUID()
  interviewerId: string;

  @IsString()
  description: string;

  @IsUUID()
  positionId: string;
}
