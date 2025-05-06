import { registerAs } from '@nestjs/config';

export default registerAs('transcription', () => ({
  url: process.env.TRANSCRIPTION_URL,
  model: process.env.TRANSCRIPTION_MODEL,
}));
