import { LLMModule, LLMService } from '@app/llm';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EmbeddingService } from './embedding.service';
import { EmbeddingOptions } from './embedding.types';

@Module({})
export class EmbeddingModule {
  static forRootAsync(
    options: (configService: ConfigService) => EmbeddingOptions,
  ): DynamicModule {
    return {
      module: EmbeddingModule,
      imports: [
        LLMModule.forRootAsync({
          useFactory: (configService: ConfigService) =>
            options(configService).connectionOptions,
          inject: [ConfigService],
        }),
      ],
      providers: [
        {
          provide: EmbeddingService,
          useFactory: (configService: ConfigService, llmService: LLMService) =>
            new EmbeddingService(options(configService), llmService),
          inject: [ConfigService, LLMService],
        },
      ],
      exports: [EmbeddingService],
    };
  }
}
