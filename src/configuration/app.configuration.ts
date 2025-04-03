import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.APP_ENV,
  port: process.env.PORT,
  frontendUrl: process.env.FRONTEND_URL,
}));
