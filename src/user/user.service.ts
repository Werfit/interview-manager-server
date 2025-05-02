import { Injectable, Logger } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { User } from '@prisma/client';
import { hashValue } from 'src/shared/utilities/hashing/hashing.utility';
import { tryCatch } from 'src/shared/utilities/try-catch/try-catch.utility';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async checkIfUserExistsByEmail(email: string) {
    this.logger.debug('UserService::checkIfUserExists', { email });

    const [userCountSuccess, data] = await tryCatch(() =>
      this.txHost.tx.user.count({
        where: { email },
      }),
    );

    if (!userCountSuccess) {
      this.logger.error(data);
      return false;
    }

    return data > 0;
  }

  async checkIfUserExistsById(id: string) {
    this.logger.debug('UserService::checkIfUserExistsById', { id });

    const [userCountSuccess, data] = await tryCatch(() =>
      this.txHost.tx.user.count({ where: { id } }),
    );

    if (!userCountSuccess) {
      this.logger.error(data);
      return false;
    }

    return data > 0;
  }

  async findUserByEmail(email: string) {
    this.logger.debug('UserService::findUserByEmail', { email });

    const [userFindSuccess, data] = await tryCatch(() =>
      this.txHost.tx.user.findUnique({
        where: { email },
      }),
    );

    if (!userFindSuccess) {
      this.logger.error(data);
      return null;
    }

    return data;
  }

  async findUserById(id: string) {
    this.logger.debug('UserService::findUserById', { id });

    const [userFindSuccess, data] = await tryCatch(() =>
      this.txHost.tx.user.findUnique({
        where: { id },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    );

    if (!userFindSuccess) {
      this.logger.error(data);
      return null;
    }

    return data;
  }

  async createUser(user: {
    email: User['email'];
    password: User['password'];
    firstName?: User['firstName'];
    lastName?: User['lastName'];
  }) {
    this.logger.debug('UserService::createUser', { user });

    const [userCreateSuccess, data] = await tryCatch(async () =>
      this.txHost.tx.user.create({
        data: {
          email: user.email,
          password: await hashValue(user.password),
          firstName: user.firstName,
          lastName: user.lastName,
        },
      }),
    );

    if (!userCreateSuccess) {
      this.logger.error(data);
      return null;
    }

    return data;
  }

  async setUserName(user: Pick<User, 'id' | 'firstName' | 'lastName'>) {
    this.logger.debug('UserService::setUserName', { user });

    const [userUpdateSuccess, userUpdateError] = await tryCatch(() =>
      this.txHost.tx.user.update({
        where: { id: user.id },
        data: { firstName: user.firstName, lastName: user.lastName },
      }),
    );

    if (!userUpdateSuccess) {
      this.logger.error(userUpdateError);
      return null;
    }

    return userUpdateSuccess;
  }

  async setUserOrganization(user: Pick<User, 'id' | 'organizationId'>) {
    this.logger.debug('UserService::setUserOrganization', { user });

    const [userUpdateSuccess, userUpdateError] = await tryCatch(() =>
      this.txHost.tx.user.update({
        where: { id: user.id },
        data: { organizationId: user.organizationId },
      }),
    );

    if (!userUpdateSuccess) {
      this.logger.error(userUpdateError);
      return null;
    }

    return userUpdateSuccess;
  }

  async getUsersByOrganizationId(organizationId: string) {
    this.logger.debug('UserService::getUsersByOrganizationId', {
      organizationId,
    });

    const [usersFindSuccess, data] = await tryCatch(() =>
      this.txHost.tx.user.findMany({ where: { organizationId } }),
    );

    if (!usersFindSuccess) {
      this.logger.error(data);
      return null;
    }

    return data.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }));
  }
}
