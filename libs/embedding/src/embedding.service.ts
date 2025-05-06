import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Ollama } from 'ollama';
import { tryCatch } from 'utilities/try-catch/try-catch.utility';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly ollama: Ollama;

  constructor(
    private readonly options: {
      model: string;
      url: string;
    },
  ) {
    console.log('EmbeddingService::constructor', this.options);
    this.ollama = new Ollama({
      host: this.options.url,
    });
  }

  async embedText(text: string[]) {
    this.logger.log('EmbeddingService::embedText', text);
    const [success, response] = await tryCatch(() => {
      return this.ollama.embed({
        model: this.options.model,
        input: text.join('\n'),
      });
    });

    if (!success) {
      this.logger.error('EmbeddingService::embedText', response);
      throw new InternalServerErrorException('Failed to embed text');
    }

    return response.embeddings;
  }
}
