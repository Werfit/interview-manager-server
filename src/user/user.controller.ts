import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/authentication/guards/access-token.guard';
import { OrganizationService } from 'src/organization/organization.service';
import { JwtPayload, User } from 'src/shared/decorators/user.decorator';
import { tryCatch } from 'src/shared/utilities/try-catch/try-catch.utility';

import { CompleteInformationRequestDto } from './dto/complete-information-request.dto';
import { GetUserResponseDto } from './dto/get-user-response.dto';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(AccessTokenGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly organizationService: OrganizationService,
  ) {}

  @Get()
  async getUser(@User() userPayload: JwtPayload): Promise<GetUserResponseDto> {
    const user = await this.userService.findUserById(userPayload.sub);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationId: user.organization?.id ?? null,
      organizationName: user.organization?.name ?? null,
    };
  }

  @Post('complete-information')
  async completeInformation(
    @User() userPayload: JwtPayload,
    @Body() completeInformationRequestDto: CompleteInformationRequestDto,
  ) {
    const user = await this.userService.findUserById(userPayload.sub);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.organizationId) {
      throw new BadRequestException('User already has an organization');
    }

    const [userUpdateSuccess] = await tryCatch(() =>
      this.userService.setUserName({
        id: user.id,
        firstName: completeInformationRequestDto.firstName,
        lastName: completeInformationRequestDto.lastName,
      }),
    );

    if (!userUpdateSuccess) {
      throw new InternalServerErrorException('Failed to update user');
    }

    const [organizationCreateSuccess, organization] = await tryCatch(() =>
      this.organizationService.findOrganizationByName({
        name: completeInformationRequestDto.organizationName,
      }),
    );

    if (!organizationCreateSuccess) {
      throw new InternalServerErrorException('Organization not found');
    }

    if (organization) {
      // TODO: Should notify the owner of the organization
      const [userOrganizationUpdateSuccess] = await tryCatch(() =>
        this.userService.setUserOrganization({
          id: user.id,
          organizationId: organization.id,
        }),
      );

      if (!userOrganizationUpdateSuccess) {
        throw new InternalServerErrorException(
          'Failed to update user organization',
        );
      }

      return {
        success: true,
      };
    }

    // create the organization
    const [newOrganizationCreateSuccess, newOrganization] = await tryCatch(() =>
      this.organizationService.createOrganization({
        name: completeInformationRequestDto.organizationName,
        ownerId: user.id,
      }),
    );

    if (!newOrganizationCreateSuccess) {
      throw new InternalServerErrorException('Failed to create organization');
    }

    const [userOrganizationUpdateSuccess] = await tryCatch(() =>
      this.userService.setUserOrganization({
        id: user.id,
        organizationId: newOrganization.id,
      }),
    );

    if (!userOrganizationUpdateSuccess) {
      throw new InternalServerErrorException(
        'Failed to update user organization',
      );
    }

    return {
      success: true,
    };
  }
}
