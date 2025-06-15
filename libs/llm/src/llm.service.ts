import { openai } from '@ai-sdk/openai';
import { ProviderV1 } from '@ai-sdk/provider';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { embed, generateObject, streamText } from 'ai';
import { createOllama } from 'ollama-ai-provider';
import { tryCatch } from 'utilities/try-catch/try-catch.utility';
import { z } from 'zod';

import { MODULE_OPTIONS_TOKEN } from './llm.module-definition';
import { LLM_PROVIDER, LLMOptions } from './llm.types';

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private readonly options: LLMOptions,
  ) {}

  generate(prompt: string, model: string) {
    const provider = this.getProvider();

    return streamText({
      model: provider.languageModel(model),
      prompt,
    });
  }

  async generateObject<OBJECT>(
    prompt: string,
    model: string,
    schema: z.Schema<OBJECT, z.ZodTypeDef, any>,
  ) {
    const provider = this.getProvider();

    const [success, response] = await tryCatch(() => {
      return generateObject({
        model: provider.languageModel(model),
        prompt,
        schema,
      });
    });

    if (!success) {
      this.logger.error(response);
      throw new Error('Failed to generate object');
    }

    return response;
  }

  async embedText(text: string, model: string) {
    const provider = this.getProvider();

    const [success, embedding] = await tryCatch(() => {
      return embed({
        model: provider.textEmbeddingModel(model),
        value: text,
      });
    });

    if (!success) {
      this.logger.error(embedding);
      throw new Error('Failed to embed text');
    }

    return embedding;
  }

  private getProvider(): ProviderV1 {
    switch (this.options.provider) {
      case LLM_PROVIDER.OLLAMA: {
        return createOllama({
          baseURL: this.options.url,
        });
      }
      case LLM_PROVIDER.OPENAI: {
        return openai;
      }
    }
  }
}
