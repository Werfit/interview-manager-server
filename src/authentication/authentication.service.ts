import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { compareHashedValue } from 'src/shared/utilities/hashing/hashing.utility';
import { UserService } from 'src/user/user.service';

import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto';
import { SignInRequestDto } from './dto/sign-in-request.dto.';
import { SignInResponseDto } from './dto/sign-in-response.dto.';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import { SignUpResponseDto } from './dto/sign-up-response.dto';
import { SessionService } from './session.service';
import { GoogleUser } from './types/google-user.type';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpRequestDto: SignUpRequestDto): Promise<SignUpResponseDto> {
    this.logger.debug('AuthenticationService::signUp', { signUpRequestDto });
    const existingUser = await this.userService.checkIfUserExists(
      signUpRequestDto.email,
    );

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const user = await this.userService.createUser({
      email: signUpRequestDto.email,
      password: signUpRequestDto.password,
    });

    if (!user) {
      throw new InternalServerErrorException('Failed to create user');
    }

    await this.sessionService.cleanUpExpiredSessions(user.id);

    const tokens = await this.issueTokens({ user });
    await this.updateSession({ user, refreshToken: tokens.refreshToken });

    return tokens;
  }

  async signIn(signInRequestDto: SignInRequestDto): Promise<SignInResponseDto> {
    this.logger.debug('AuthenticationService::signIn', { signInRequestDto });

    const existingUser = await this.userService.findUserByEmail(
      signInRequestDto.email,
    );

    if (!existingUser) {
      throw new BadRequestException('User does not exist');
    }

    const isPasswordValid = await compareHashedValue(
      signInRequestDto.password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('User does not exist');
    }

    await this.sessionService.cleanUpExpiredSessions(existingUser.id);

    const tokens = await this.issueTokens({ user: existingUser });
    await this.updateSession({
      user: existingUser,
      refreshToken: tokens.refreshToken,
    });

    return tokens;
  }

  async signOut({ refreshToken }: { refreshToken: string }) {
    await this.sessionService.deleteSession(refreshToken);
  }

  async refreshToken({
    user,
    refreshToken,
  }: {
    user: Pick<User, 'id'>;
    refreshToken: string;
  }): Promise<RefreshTokenResponseDto> {
    this.logger.debug('AuthenticationService::refreshToken', {
      user,
      refreshToken,
    });

    const session = await this.sessionService.findSessionByRefreshToken({
      userId: user.id,
      refreshToken,
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.sessionService.deleteSessionByUserId(session);

    const tokens = await this.issueTokens({ user: session.user });
    await this.updateSession({
      user: session.user,
      refreshToken: tokens.refreshToken,
    });

    return tokens;
  }

  async handleGoogleAuth(googleUser: GoogleUser): Promise<SignInResponseDto> {
    this.logger.debug('AuthenticationService::handleGoogleAuth', {
      email: googleUser.email,
      firstName: googleUser.firstName,
      lastName: googleUser.lastName,
    });

    let user = await this.userService.findUserByEmail(googleUser.email);

    // If user doesn't exist, create a new one
    if (!user) {
      user = await this.userService.createUser({
        email: googleUser.email,
        password: '', // No password needed for Google auth
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
      });

      if (!user) {
        throw new InternalServerErrorException('Failed to create user');
      }
    }

    const tokens = await this.issueTokens({ user });

    // Create session
    await this.updateSession({
      user,
      refreshToken: tokens.refreshToken,
    });

    return tokens;
  }

  private async updateSession({
    user,
    refreshToken,
  }: {
    user: Pick<User, 'id'>;
    refreshToken: string;
  }) {
    const { expiresIn } = this.getTokenOptions({ type: 'refresh' });
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    await this.sessionService.createSession({
      userId: user.id,
      refreshToken,
      expiresAt,
    });
  }

  private async issueTokens({
    user,
  }: {
    user: Pick<User, 'id' | 'email'>;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.issueToken({ user, type: 'access' });
    const refreshToken = await this.issueToken({ user, type: 'refresh' });

    return { accessToken, refreshToken };
  }

  private async issueToken({
    user,
    type,
  }: {
    user: Pick<User, 'id' | 'email'>;
    type: 'access' | 'refresh';
  }) {
    const payload = { sub: user.id, email: user.email };
    const { expiresIn, secret } = this.getTokenOptions({ type });

    return this.jwtService.signAsync(payload, {
      expiresIn,
      secret,
    });
  }

  private getTokenOptions({ type }: { type: 'access' | 'refresh' }): {
    expiresIn: number;
    secret: string;
  } {
    if (type === 'access') {
      return {
        expiresIn: this.configService.getOrThrow<number>('jwt.expiresIn'),
        secret: this.configService.getOrThrow<string>('jwt.secret'),
      };
    }

    return {
      expiresIn: this.configService.getOrThrow<number>('jwt.refreshExpiresIn'),
      secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
    };
  }
}
