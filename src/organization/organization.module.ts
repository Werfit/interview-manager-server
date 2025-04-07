import { Module } from '@nestjs/common';
import { InterviewStatusModule } from 'src/interview/interview-status/interview-status.module';

import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

@Module({
  imports: [InterviewStatusModule],
  providers: [OrganizationService],
  controllers: [OrganizationController],
  exports: [OrganizationService],
})
export class OrganizationModule {}
