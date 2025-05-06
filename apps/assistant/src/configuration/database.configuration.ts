import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  chroma: {
    url: process.env.CHROMA_DB_URL,
    collection: process.env.CHROMA_DB_COLLECTION,
  },
}));
