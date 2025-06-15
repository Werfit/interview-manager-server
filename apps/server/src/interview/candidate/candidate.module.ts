import { Module } from '@nestjs/common';
import { MediaModule } from 'apps/server/media/media.module';

import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';
import { CvModule } from './cv/cv.module';

@Module({
  imports: [MediaModule, CvModule],
  controllers: [CandidateController],
  providers: [CandidateService],
  exports: [CandidateService, CvModule],
})
export class CandidateModule {}
