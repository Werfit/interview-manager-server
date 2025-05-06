import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetRecordingsQueryDto {
  @IsUUID()
  @IsNotEmpty()
  interviewId: string;
}
