import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/authentication/guards/access-token.guard';
import {
  OrganizationUser,
  UserOrganizationGuard,
} from 'src/authentication/guards/user-organization.guard';
import { User } from 'src/shared/decorators/user.decorator';

import { CreateInterviewStatusRequestDto } from './dto/create-interview-status.dto';
import { UpdateInterviewStatusRequestDto } from './dto/update-interview-status.dto';
import { InterviewStatusService } from './interview-status.service';

@Controller('interviews/interview-statuses')
@UseGuards(AccessTokenGuard, UserOrganizationGuard)
export class InterviewStatusController {
  constructor(
    private readonly interviewStatusService: InterviewStatusService,
  ) {}

  @Get('list')
  async getInterviewStatuses(@User() user: OrganizationUser) {
    return this.interviewStatusService.getInterviewStatuses({
      organizationId: user.organizationId,
    });
  }

  @Post()
  async createInterviewStatus(
    @User() user: OrganizationUser,
    @Body() body: CreateInterviewStatusRequestDto,
  ) {
    return this.interviewStatusService.createInterviewStatus({
      ...body,
      organizationId: user.organizationId,
    });
  }

  @Patch(':id')
  async updateInterviewStatus(
    @User() user: OrganizationUser,
    @Param('id') id: string,
    @Body() body: UpdateInterviewStatusRequestDto,
  ) {
    return this.interviewStatusService.updateInterviewStatus({
      ...body,
      organizationId: user.organizationId,
      id,
    });
  }

  @Delete(':id')
  async deleteInterviewStatus(
    @User() user: OrganizationUser,
    @Param('id') id: string,
  ) {
    return this.interviewStatusService.deleteInterviewStatus({
      organizationId: user.organizationId,
      id,
    });
  }
}
