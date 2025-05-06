import { registerAs } from '@nestjs/config';

export default registerAs('socket', () => ({
  port: process.env.SOCKET_PORT,
}));
