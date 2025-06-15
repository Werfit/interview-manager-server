import { LLM_PROVIDER, LLMProvider } from '@app/llm/llm.types';
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsNumber()
  PORT: number;

  @IsString()
  CORS_ORIGIN: string;

  // Assistant
  @IsString()
  ASSISTANT_MODEL: string;

  @IsString()
  ASSISTANT_URL: string;

  @IsEnum(LLM_PROVIDER)
  ASSISTANT_PROVIDER: LLMProvider;

  // Chroma
  @IsString()
  CHROMA_DB_URL: string;
  CHROMA_DB_COLLECTION: string;

  // Embedding
  @IsString()
  EMBEDDING_MODEL: string;

  @IsString()
  EMBEDDING_URL: string;

  @IsEnum(LLM_PROVIDER)
  EMBEDDING_PROVIDER: LLMProvider;
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
