import { LLMService } from '@app/llm';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { tryCatch } from 'utilities/try-catch/try-catch.utility';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);

  constructor(
    private readonly options: {
      model: string;
    },
    private readonly llmService: LLMService,
  ) {}

  async embedText(text: string[]) {
    this.logger.log('EmbeddingService::embedText', text);
    const [success, response] = await tryCatch(() =>
      this.llmService.embedText(text.join('\n'), this.options.model),
    );

    if (!success) {
      this.logger.error('EmbeddingService::embedText', response);
      throw new InternalServerErrorException('Failed to embed text');
    }

    return response.embedding;
  }
}
