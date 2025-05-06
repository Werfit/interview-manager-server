import { Injectable, Logger } from '@nestjs/common';
import ollama from 'ollama';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);

  constructor(
    private readonly options: {
      model: string;
    },
  ) {}

  async embedText(text: string[]) {
    this.logger.log('EmbeddingService::embedText', text);
    const response = await ollama.embed({
      model: this.options.model,
      input: text.join('\n'),
    });

    return response.embeddings;
  }
}
