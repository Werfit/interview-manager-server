import { registerAs } from '@nestjs/config';

export default registerAs('llm', () => ({
  model: process.env.OLLAMA_MODEL,
  url: process.env.OLLAMA_URL,
}));
