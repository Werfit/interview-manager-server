import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Query,
  Sse,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { AccessTokenGuard } from 'src/authentication/guards/access-token.guard';
import {
  OrganizationUser,
  UserOrganizationGuard,
} from 'src/authentication/guards/user-organization.guard';
import { User } from 'src/shared/decorators/user.decorator';
import { UserService } from 'src/user/user.service';

import { CVInterceptor } from './candidate/interceptors/cv.interceptor';
import { CVValidationPipe } from './candidate/validation/cv-validation.pipe';
import { CreateInterviewRequestDto } from './dto/create-interview-request.dto';
import { StreamAssistantRequestDto } from './dto/stream-assistant-request.dto';
import { InterviewService } from './interview.service';

@Controller('interviews')
@UseGuards(AccessTokenGuard, UserOrganizationGuard)
export class InterviewController {
  constructor(
    private readonly userService: UserService,
    private readonly interviewService: InterviewService,
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

  @Get('/:id/assistant')
  @Sse()
  streamAssistantResponse(
    @Query() body: StreamAssistantRequestDto,
    @Param('id') id: string,
  ): Observable<string> {
    return new Observable<string>((subscriber) => {
      const response = axios.post(
        `http://127.0.0.1:9000/api/v1/assistant`, // TODO: Add to env
        {
          userInput: body.content,
          interviewId: id,
        },
        {
          responseType: 'stream',
        },
      );

      response
        .then((response: AxiosResponse) => {
          const stream = response.data as NodeJS.ReadableStream;

          stream.on('data', (chunk: Buffer) => {
            console.log('chunk', chunk.toString());
            subscriber.next(chunk.toString());
          });

          stream.on('end', () => {
            subscriber.complete();
          });

          stream.on('error', (error: Error) => {
            console.log('error', error);
            subscriber.error(error);
          });
        })
        .catch((error) => {
          subscriber.error(error);
        });
    });
  }
}
