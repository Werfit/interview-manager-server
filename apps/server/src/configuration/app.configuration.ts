import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  cors: process.env.CORS_ORIGIN,
  llmOrigin: process.env.LLM_ORIGIN,
  analyzerOrigin: process.env.ANALYZER_ORIGIN,
}));
