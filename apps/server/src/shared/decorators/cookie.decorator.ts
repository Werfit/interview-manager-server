import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Cookies = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();

    return data
      ? (request.cookies?.[data] as string)
      : (request.cookies as Record<string, string>);
  },
);
