import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,

  chroma: {
    url: process.env.CHROMA_DB_URL,
    collection: process.env.CHROMA_DB_COLLECTION,
  },
}));
