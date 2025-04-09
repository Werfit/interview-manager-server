import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/authentication/guards/access-token.guard';
import {
  OrganizationUser,
  UserOrganizationGuard,
} from 'src/authentication/guards/user-organization.guard';
import { FileManagerService } from 'src/file-uploader/services/file-manager.service';
import { User } from 'src/shared/decorators/user.decorator';
import { UserService } from 'src/user/user.service';

import { CVInterceptor } from './candidate/interceptors/cv.interceptor';
import { CVValidationPipe } from './candidate/validation/cv-validation.pipe';
import { CreateInterviewRequestDto } from './dto/create-interview-request.dto';
import { InterviewService } from './interview.service';

@Controller('interviews')
@UseGuards(AccessTokenGuard, UserOrganizationGuard)
export class InterviewController {
  constructor(
    private readonly userService: UserService,
    private readonly interviewService: InterviewService,
    private readonly fileManagerService: FileManagerService,
  ) {}

  @Get('list')
  async getInterviews(@User() user: OrganizationUser) {
    return this.interviewService.getInterviews(user.organizationId);
  }

  @Get(':id')
  async getInterview(@User() user: OrganizationUser, @Param('id') id: string) {
    return this.interviewService.getInterview({
      id,
      organizationId: user.organizationId,
    });
  }

  @Post()
  @UseInterceptors(CVInterceptor('cv'))
  async createInterview(
    @User() user: OrganizationUser,
    @Body() createInterviewRequestDto: CreateInterviewRequestDto,
    @UploadedFile(
      new CVValidationPipe({
        fileIsRequired: false,
      }),
    )
    cv?: Express.Multer.File,
  ) {
    const interviewer = await this.userService.findUserById(
      createInterviewRequestDto.interviewerId,
    );

    if (!interviewer) {
      throw new NotFoundException('Interviewer not found');
    }

    if (cv) {
      return this.interviewService.createInterview({
        ...createInterviewRequestDto,
        organizationId: user.organizationId,
        cvPath: cv.path,
      });
    }

    return this.interviewService.createInterview({
      ...createInterviewRequestDto,
      organizationId: user.organizationId,
    });
  }

  @Get('interviewers/list')
  async getInterviewers(@User() user: OrganizationUser) {
    const organizationUsers = await this.userService.getUsersByOrganizationId(
      user.organizationId,
    );

    if (!organizationUsers) {
      throw new InternalServerErrorException('Error fetching interviewers');
    }

    return organizationUsers;
  }
}
