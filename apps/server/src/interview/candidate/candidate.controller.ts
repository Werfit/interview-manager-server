import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'apps/server/authentication/guards/access-token.guard';
import { UserOrganizationGuard } from 'apps/server/authentication/guards/user-organization.guard';

import { CandidateService } from './candidate.service';
import { VerifyCandidateQueryDto } from './dto/verify-candidate-query.dto';

@Controller('interviews/candidates')
@UseGuards(AccessTokenGuard, UserOrganizationGuard)
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Get('/verify')
  async verifyCandidate(@Query() query: VerifyCandidateQueryDto) {
    const exists = await this.candidateService.checkIfExists(query.email);

    return { exists };
  }

  @Get('/:id')
  async getCandidate(@Param('id') id: string) {
    return this.candidateService.getCandidate({ id });
  }
}
