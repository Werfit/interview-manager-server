import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsNumber()
  PORT: number;

  @IsString()
  CORS_ORIGIN: string;

  @IsNumber()
  SOCKET_PORT: number;

  @IsString()
  LLM_ORIGIN: string;
  @IsString()
  DATABASE_URL: string;

  @IsString()
  POSTGRES_USER: string;

  @IsString()
  POSTGRES_PASSWORD: string;

  @IsString()
  POSTGRES_DB: string;

  @IsEnum(['development', 'production', 'test'])
  APP_ENV: 'development' | 'production' | 'test';

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRATION_TIME: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_REFRESH_EXPIRATION_TIME: string;

  @IsString()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  GOOGLE_CLIENT_SECRET: string;

  @IsString()
  GOOGLE_REDIRECT_URI: string;

  @IsString()
  GOOGLE_FRONTEND_REDIRECT_URI: string;

  @IsString()
  REDIS_URL: string;

  @IsString()
  RABBIT_MQ_HOST: string;

  @IsNumber()
  RABBIT_MQ_PORT: number;

  @IsString()
  RABBIT_MQ_USER: string;

  @IsString()
  RABBIT_MQ_PASSWORD: string;

  @IsString()
  RABBIT_MQ_QUEUE: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
