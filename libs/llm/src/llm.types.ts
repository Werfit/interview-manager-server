export const LLM_PROVIDER = {
  OLLAMA: 'ollama',
  OPENAI: 'openai',
} as const;

export type LLMProvider = (typeof LLM_PROVIDER)[keyof typeof LLM_PROVIDER];

export type LLMOptions = {
  provider: LLMProvider;
  url: string;
};
