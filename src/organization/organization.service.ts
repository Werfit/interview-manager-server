import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Organization } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { tryCatch } from 'src/shared/utilities/try-catch/try-catch.utility';

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);
  constructor(private readonly databaseService: DatabaseService) {}

  async checkIfOrganizationExistsByName(data: Pick<Organization, 'name'>) {
    this.logger.debug('OrganizationService::checkIfOrganizationExistsByName', {
      data,
    });

    const [organizationFindSuccess, organization] = await tryCatch(() =>
      this.databaseService.organization.findUnique({
        where: {
          name: data.name,
        },
      }),
    );

    if (!organizationFindSuccess) {
      this.logger.error(organization);
      return false;
    }

    return !!organization;
  }

  async findOrganizationByName(data: Pick<Organization, 'name'>) {
    this.logger.debug('OrganizationService::findOrganizationByName', { data });

    const [organizationFindSuccess, organization] = await tryCatch(() =>
      this.databaseService.organization.findUnique({
        where: {
          name: data.name,
        },
      }),
    );

    if (!organizationFindSuccess) {
      this.logger.error(organization);
      return null;
    }

    return organization;
  }

  async createOrganization(data: Pick<Organization, 'name' | 'ownerId'>) {
    this.logger.debug('OrganizationService::createOrganization', { data });

    if (await this.checkIfOrganizationExistsByName(data)) {
      throw new ConflictException('Organization already exists');
    }

    return this.databaseService.organization.create({
      data,
    });
  }
}
