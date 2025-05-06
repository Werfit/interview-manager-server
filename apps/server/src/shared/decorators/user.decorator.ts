import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as UserModel } from '@prisma/client';
import { Request } from 'express';

export interface JwtPayload {
  sub: UserModel['id'];
  email: UserModel['email'];
}

export const User = createParamDecorator(
  (_: unknown, context: ExecutionContext): JwtPayload => {
    const request = context.switchToHttp().getRequest<Request>();
    return request.user as JwtPayload;
  },
);
