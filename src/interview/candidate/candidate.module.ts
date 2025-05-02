import { Module } from '@nestjs/common';
import { MediaModule } from 'src/media/media.module';

import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';

@Module({
  imports: [MediaModule],
  controllers: [CandidateController],
  providers: [CandidateService],
  exports: [CandidateService],
})
export class CandidateModule {}
