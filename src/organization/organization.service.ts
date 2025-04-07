import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Organization } from '@prisma/client';
import { InterviewStatusService } from 'src/interview/interview-status/interview-status.service';
import { tryCatch } from 'src/shared/utilities/try-catch/try-catch.utility';

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    private readonly interviewStatusService: InterviewStatusService,
  ) {}

  async checkIfOrganizationExistsByName(data: Pick<Organization, 'name'>) {
    this.logger.debug('OrganizationService::checkIfOrganizationExistsByName', {
      data,
    });

    const [organizationFindSuccess, organization] = await tryCatch(() =>
      this.txHost.tx.organization.findUnique({
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
      this.txHost.tx.organization.findUnique({
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

    return this.txHost.withTransaction(async () => {
      const organization = await this.txHost.tx.organization.create({
        data,
      });

      await this.interviewStatusService.createDefaultInterviewStatuses({
        organizationId: organization.id,
      });

      return organization;
    });
  }
}
