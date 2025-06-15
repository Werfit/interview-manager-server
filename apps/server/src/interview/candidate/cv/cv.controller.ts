import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { CVInterceptor } from '../interceptors/cv.interceptor';
import { CVValidationPipe } from '../validation/cv-validation.pipe';
import { CvService } from './cv.service';
import { ReprocessCvDto } from './dto/reprocess-cv.dto';
import { UploadCvDto } from './dto/upload-cv.dto';

@Controller('interviews/candidates/:candidateId/cvs')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post()
  @UseInterceptors(CVInterceptor('cv'))
  async uploadCv(
    @UploadedFile(new CVValidationPipe())
    file: Express.Multer.File,
    @Param('candidateId') candidateId: string,
    @Body() { interviewId }: UploadCvDto,
  ) {
    return this.cvService.uploadCv({
      url: file.path,
      candidateId,
      interviewId,
    });
  }

  @Post(':cvId/reprocess')
  async reprocessCv(
    @Param('cvId') cvId: string,
    @Body() { interviewId }: ReprocessCvDto,
  ) {
    return this.cvService.reprocessCv({ id: cvId, interviewId });
  }

  @Delete()
  async deleteCv(@Param('candidateId') candidateId: string) {
    return this.cvService.deleteCv(candidateId);
  }
}
