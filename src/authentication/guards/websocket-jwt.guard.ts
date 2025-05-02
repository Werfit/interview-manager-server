import { Injectable } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtPayload } from 'src/shared/decorators/user.decorator';

@Injectable()
export class WebSocketJwtGuard extends AuthGuard('websocket-jwt') {
  getRequest(context: ExecutionContext) {
    const client: Socket = context.switchToWs().getClient();
    return client.handshake;
  }

  handleRequest<TUser = JwtPayload>(error: Error | null, user: TUser): TUser {
    if (error || !user) {
      throw new WsException('Unauthorized');
    }

    return user;
  }
}
