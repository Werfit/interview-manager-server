import { IsEmail } from 'class-validator';

export class VerifyCandidateQueryDto {
  @IsEmail(undefined, {
    message: 'Invalid email address',
  })
  email: string;
}
