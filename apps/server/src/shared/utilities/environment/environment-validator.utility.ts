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

  // Postgres
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

  // JWT
  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRATION_TIME: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_REFRESH_EXPIRATION_TIME: string;

  // Google
  @IsString()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  GOOGLE_CLIENT_SECRET: string;

  @IsString()
  GOOGLE_REDIRECT_URI: string;

  @IsString()
  GOOGLE_FRONTEND_REDIRECT_URI: string;

  // Redis
  @IsString()
  REDIS_URL: string;

  // Whisper
  @IsString()
  TRANSCRIPTION_URL: string;

  @IsString()
  TRANSCRIPTION_MODEL: string;

  // Chroma
  @IsString()
  CHROMA_DB_URL: string;

  @IsString()
  CHROMA_DB_COLLECTION: string;

  // Embedding
  @IsString()
  EMBEDDING_MODEL: string;

  @IsString()
  EMBEDDING_URL: string;
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
