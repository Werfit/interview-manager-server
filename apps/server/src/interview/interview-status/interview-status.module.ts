import { Module } from '@nestjs/common';

import { InterviewStatusController } from './interview-status.controller';
import { InterviewStatusService } from './interview-status.service';

@Module({
  providers: [InterviewStatusService],
  exports: [InterviewStatusService],
  controllers: [InterviewStatusController],
})
export class InterviewStatusModule {}
