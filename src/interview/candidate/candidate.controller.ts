import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/authentication/guards/access-token.guard';

import { CandidateService } from './candidate.service';
import { VerifyCandidateQueryDto } from './dto/verify-candidate-query.dto';

@Controller('interviews/candidates')
@UseGuards(AccessTokenGuard)
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Get('/verify')
  async verifyCandidate(@Query() query: VerifyCandidateQueryDto) {
    const exists = await this.candidateService.checkIfExists(query.email);

    return { exists };
  }
}
