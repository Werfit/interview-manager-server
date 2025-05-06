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
import { AccessTokenGuard } from 'apps/server/authentication/guards/access-token.guard';
import {
  OrganizationUser,
  UserOrganizationGuard,
} from 'apps/server/authentication/guards/user-organization.guard';
import { User } from 'apps/server/shared/decorators/user.decorator';

import { CreatePositionRequestDto } from './dto/create-position-request.dto';
import { UpdatePositionRequestDto } from './dto/update-position-request.dto';
import { PositionService } from './position.service';

@Controller('interviews/positions')
@UseGuards(AccessTokenGuard, UserOrganizationGuard)
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Get('list')
  async getPositions(@User() user: OrganizationUser) {
    console.log('get positions', user);
    const organizationId = user.organizationId;
    console.log('get positions', organizationId);
    const result = await this.positionService.getPositions({
      organizationId,
    });

    console.log('get positions', result);
    return result;
  }

  @Post()
  async createPosition(
    @User() user: OrganizationUser,
    @Body() body: CreatePositionRequestDto,
  ) {
    const organizationId = user.organizationId;
    return this.positionService.createPosition({ organizationId, ...body });
  }

  @Patch(':id')
  async updatePosition(
    @User() user: OrganizationUser,
    @Param('id') id: string,
    @Body() body: UpdatePositionRequestDto,
  ) {
    const organizationId = user.organizationId;
    return this.positionService.updatePosition({ organizationId, id, ...body });
  }

  @Delete(':id')
  async deletePosition(
    @User() user: OrganizationUser,
    @Param('id') id: string,
  ) {
    const organizationId = user.organizationId;
    return this.positionService.deletePosition({ organizationId, id });
  }
}
