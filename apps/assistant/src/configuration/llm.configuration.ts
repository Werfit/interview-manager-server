import { registerAs } from '@nestjs/config';

export default registerAs('llm', () => ({
  assistant: {
    model: process.env.ASSISTANT_MODEL,
    url: process.env.ASSISTANT_URL,
    provider: process.env.ASSISTANT_PROVIDER,
  },
}));
