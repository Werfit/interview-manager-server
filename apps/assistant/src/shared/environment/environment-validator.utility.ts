import { plainToInstance } from 'class-transformer';
import { IsNumber, IsString, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsNumber()
  PORT: number;

  @IsString()
  CORS_ORIGIN: string;

  // LLM
  @IsString()
  OLLAMA_MODEL: string;

  @IsString()
  OLLAMA_URL: string;

  // Chroma
  @IsString()
  CHROMA_DB_URL: string;
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
