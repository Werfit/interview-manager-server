import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: process.env.PORT,
  cors: process.env.CORS_ORIGIN,
}));
