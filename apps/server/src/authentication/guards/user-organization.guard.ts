import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Organization } from '@prisma/client';
import { Request } from 'express';
import { JwtPayload } from 'apps/server/shared/decorators/user.decorator';
import { UserService } from 'apps/server/user/user.service';

export type OrganizationUser = JwtPayload & {
  organizationId: Organization['id'];
};

@Injectable()
export class UserOrganizationGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    if (!request.user) {
      throw new UnauthorizedException('User not found');
    }

    const userPayload = request.user as JwtPayload;

    const user = await this.userService.findUserById(userPayload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    request.user.organizationId = user.organizationId;

    return true;
  }
}
