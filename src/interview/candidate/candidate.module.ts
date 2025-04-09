import { Module } from '@nestjs/common';
import { FileUploaderModule } from 'src/file-uploader/file-uploader.module';

import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';

@Module({
  imports: [FileUploaderModule],
  controllers: [CandidateController],
  providers: [CandidateService],
  exports: [CandidateService],
})
export class CandidateModule {}
