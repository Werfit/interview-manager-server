import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/authentication/guards/access-token.guard';
import { UserOrganizationGuard } from 'src/authentication/guards/user-organization.guard';

import { CandidateService } from './candidate.service';
import { VerifyCandidateQueryDto } from './dto/verify-candidate-query.dto';
import { CVInterceptor } from './interceptors/cv.interceptor';
import { CVValidationPipe } from './validation/cv-validation.pipe';

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

  @Post('/:id/cv')
  @UseInterceptors(CVInterceptor('cv'))
  uploadCV(
    @UploadedFile(new CVValidationPipe()) file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    return this.candidateService.uploadCandidateCV({
      id,
      url: file.path,
    });
  }

  @Delete('/:id/cv')
  async deleteCV(@Param('id') id: string) {
    return this.candidateService.deleteCandidateCV(id);
  }
}
