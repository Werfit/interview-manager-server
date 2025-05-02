import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

class TimestampDTO {
  @IsNumber()
  start: number;

  @IsNumber()
  end: number;
}

export class SegmentDTO {
  @Type(() => TimestampDTO)
  timestamp: TimestampDTO;

  @IsString()
  text: string;
}
