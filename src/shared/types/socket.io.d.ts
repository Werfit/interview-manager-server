import { JwtPayload } from '../decorators/user.decorator';

declare module 'socket.io/dist/socket-types' {
  interface Handshake {
    user?: JwtPayload;
  }
}
