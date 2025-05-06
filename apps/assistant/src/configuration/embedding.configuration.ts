import { registerAs } from '@nestjs/config';

export default registerAs('embedding', () => ({
  model: process.env.EMBEDDING_MODEL,
  url: process.env.EMBEDDING_URL,
}));
