import {
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';
import { Cookies } from 'src/shared/decorators/cookie.decorator';
import { JwtPayload, User } from 'src/shared/decorators/user.decorator';

import { AuthenticationService } from './authentication.service';
import { SignInRequestDto } from './dto/sign-in-request.dto.';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { GoogleUser } from './types/google-user.type';

@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly configService: ConfigService,
  ) {}

  @Get('social/google')
  @UseGuards(GoogleOauthGuard)
  async googleAuth() {
    // This endpoint initiates the Google OAuth flow
  }

  @Get('social/google/callback')
  @UseGuards(GoogleOauthGuard)
  @Redirect()
  async googleAuthCallback(
    @User() user: GoogleUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authenticationService.handleGoogleAuth(user);

    response.cookie(
      'refreshToken',
      tokens.refreshToken,
      this.getCookieOptions('refresh'),
    );

    response.cookie(
      'accessToken',
      tokens.accessToken,
      this.getCookieOptions('access'),
    );

    const frontendUrl = this.configService.getOrThrow<string>(
      'google.frontendRedirectUri',
    );
    return { url: frontendUrl };
  }

  @Post('sign-up')
  async signUp(
    @Body() signUpRequestDto: SignUpRequestDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authenticationService.signUp(signUpRequestDto);

    response.cookie(
      'refreshToken',
      tokens.refreshToken,
      this.getCookieOptions('refresh'),
    );

    response.cookie(
      'accessToken',
      tokens.accessToken,
      this.getCookieOptions('access'),
    );

    return tokens;
  }

  @Post('sign-in')
  async signIn(
    @Body() signInRequestDto: SignInRequestDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authenticationService.signIn(signInRequestDto);

    response.cookie(
      'refreshToken',
      tokens.refreshToken,
      this.getCookieOptions('refresh'),
    );

    response.cookie(
      'accessToken',
      tokens.accessToken,
      this.getCookieOptions('access'),
    );

    return tokens;
  }

  @Post('sign-out')
  @UseGuards(RefreshTokenGuard)
  async signOut(
    @Cookies('refreshToken') refreshToken: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    await this.authenticationService.signOut({ refreshToken });

    response.clearCookie('refreshToken');
    response.clearCookie('accessToken');

    return { success: true };
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refreshToken(
    @Cookies('refreshToken') refreshToken: string | undefined,
    @User() user: JwtPayload,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const tokens = await this.authenticationService.refreshToken({
      user: { id: user.sub },
      refreshToken,
    });

    response.cookie(
      'refreshToken',
      tokens.refreshToken,
      this.getCookieOptions('refresh'),
    );

    response.cookie(
      'accessToken',
      tokens.accessToken,
      this.getCookieOptions('access'),
    );

    return tokens;
  }

  private getCookieOptions(type: 'refresh' | 'access'): CookieOptions {
    const isProduction =
      this.configService.get<string>('app.env') === 'production';

    const refreshTokenExpiresIn = this.configService.get<number>(
      'jwt.refreshExpiresIn',
    );
    const accessTokenExpiresIn =
      this.configService.get<number>('jwt.expiresIn');

    const maxAge =
      type === 'refresh' ? refreshTokenExpiresIn : accessTokenExpiresIn;

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge,
    };
  }
}
