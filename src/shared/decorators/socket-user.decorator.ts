import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';

import { JwtPayload } from './user.decorator';

export const SocketUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): JwtPayload | null => {
    const socket = context.switchToWs().getClient<Socket>();
    const handshake = socket.handshake;

    const user = handshake.user;
    return user ?? null;
  },
);
