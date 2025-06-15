import { LLMOptions } from '@app/llm/llm.types';

export type EmbeddingOptions = {
  model: string;
  connectionOptions: LLMOptions;
};
