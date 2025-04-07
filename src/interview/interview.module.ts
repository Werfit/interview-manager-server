import { Module } from '@nestjs/common';

import { CandidateModule } from './candidate/candidate.module';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';
import { InterviewStatusModule } from './interview-status/interview-status.module';
import { PositionModule } from './position/position.module';
import { RecordingModule } from './recording/recording.module';

@Module({
  imports: [
    InterviewStatusModule,
    CandidateModule,
    PositionModule,
    RecordingModule,
  ],
  controllers: [InterviewController],
  providers: [InterviewService],
})
export class InterviewModule {}
