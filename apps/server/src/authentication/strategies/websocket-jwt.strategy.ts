import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Socket } from 'socket.io';
import { JwtPayload } from 'apps/server/shared/decorators/user.decorator';
import { UserService } from 'apps/server/user/user.service';

function extractAccessTokenFromCookies(cookies: string): string | null {
  const cookieArray = cookies.split(';').map((cookie) => cookie.trim());
  const accessTokenCookie = cookieArray.find((cookie) =>
    cookie.startsWith('accessToken='),
  );

  if (!accessTokenCookie) {
    return null;
  }

  return accessTokenCookie.split('=')[1];
}

@Injectable()
export class WebSocketJwtStrategy extends PassportStrategy(
  Strategy,
  'websocket-jwt',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (handshake: Socket['handshake']) => {
          const cookies = handshake?.headers?.cookie;

          if (!cookies) {
            return null;
          }

          return extractAccessTokenFromCookies(cookies);
        },
      ]),
      secretOrKey: configService.getOrThrow<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    const userExists = await this.userService.checkIfUserExistsById(
      payload.sub,
    );

    if (!userExists) {
      throw new Error('User not found');
    }
    return payload;
  }
}
