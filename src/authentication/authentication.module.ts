import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { SessionService } from './session.service';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { GoogleAuthStrategy } from './strategies/google-auth.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { WebSocketJwtStrategy } from './strategies/websocket-jwt.strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    SessionService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    GoogleAuthStrategy,
    WebSocketJwtStrategy,
  ],
})
export class AuthenticationModule {}
