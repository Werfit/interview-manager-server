import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/authentication/guards/access-token.guard';

import { VerifyOrganizationByNameResponseDto } from './dto/verify-organization-by-name-response.dto';
import { OrganizationService } from './organization.service';

@Controller('organization')
@UseGuards(AccessTokenGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('verify/:name')
  async verifyOrganizationByName(
    @Param('name') name: string,
  ): Promise<VerifyOrganizationByNameResponseDto> {
    return {
      exists: await this.organizationService.checkIfOrganizationExistsByName({
        name,
      }),
    };
  }
}
