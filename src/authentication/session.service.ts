import { Injectable, Logger } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Session, User } from '@prisma/client';
import {
  compareHashedValue,
  hashValue,
} from 'src/shared/utilities/hashing/hashing.utility';
import { tryCatch } from 'src/shared/utilities/try-catch/try-catch.utility';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async cleanUpExpiredSessions(userId: User['id']) {
    const [sessionDeleteSuccess, data] = await tryCatch(() =>
      this.txHost.tx.session.deleteMany({
        where: {
          userId,
          expiresAt: {
            lt: new Date(),
          },
        },
      }),
    );

    if (!sessionDeleteSuccess) {
      this.logger.error(data);
      return null;
    }

    return sessionDeleteSuccess;
  }

  async createSession(
    data: Pick<Session, 'userId' | 'refreshToken' | 'expiresAt'>,
  ) {
    this.logger.debug('SessionService::createSession', { data });
    const [sessionCreateSuccess, creationData] = await tryCatch(async () =>
      this.txHost.tx.session.create({
        data: {
          userId: data.userId,
          refreshToken: await hashValue(data.refreshToken),
          expiresAt: data.expiresAt,
        },
      }),
    );

    if (!sessionCreateSuccess) {
      this.logger.error(creationData);
      return null;
    }

    return creationData;
  }

  async deleteSessionByUserId(session: Pick<Session, 'id'>) {
    this.logger.debug('SessionService::deleteSessionByUserId', { session });
    const [sessionDeleteSuccess, data] = await tryCatch(() =>
      this.txHost.tx.session.deleteMany({
        where: session,
      }),
    );

    if (!sessionDeleteSuccess) {
      this.logger.error(data);
      return null;
    }

    return sessionDeleteSuccess;
  }

  async deleteSession(refreshToken: string) {
    this.logger.debug('SessionService::deleteSession', { refreshToken });
    const [sessionDeleteSuccess, data] = await tryCatch(() =>
      this.txHost.tx.session.delete({
        where: {
          refreshToken,
        },
      }),
    );

    if (!sessionDeleteSuccess) {
      this.logger.error(data);
      return null;
    }

    return sessionDeleteSuccess;
  }

  async findSessionByRefreshToken(
    data: Pick<Session, 'userId' | 'refreshToken'>,
  ) {
    this.logger.debug('SessionService::findSessionByRefreshToken', { data });
    const [sessionFindSuccess, sessions] = await tryCatch(() =>
      this.txHost.tx.session.findMany({
        where: {
          userId: data.userId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),
    );

    if (!sessionFindSuccess) {
      this.logger.error(data);
      return null;
    }

    for (const session of sessions) {
      const isRefreshTokenValid = await compareHashedValue(
        data.refreshToken,
        session.refreshToken,
      );

      if (isRefreshTokenValid) {
        return session;
      }
    }

    return null;
  }
}
