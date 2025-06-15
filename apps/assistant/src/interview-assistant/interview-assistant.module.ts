import { LLMModule, LLMService } from '@app/llm';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmbeddingModule } from 'libs/embedding';
import { EmbeddingDatabaseModule } from 'libs/embedding-database';

import { InterviewAssistantController } from './interview-assistant.controller';
import { InterviewAssistantService } from './interview-assistant.service';

@Module({
  imports: [
    LLMModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        provider: configService.getOrThrow('llm.assistant.provider'),
        url: configService.getOrThrow('llm.assistant.url'),
      }),
      inject: [ConfigService],
    }),
    EmbeddingModule.forRootAsync((configService) => ({
      model: configService.getOrThrow('embedding.model'),
      connectionOptions: {
        provider: configService.getOrThrow('embedding.provider'),
        url: configService.getOrThrow('embedding.url'),
      },
    })),
    EmbeddingDatabaseModule,
  ],
  providers: [
    {
      provide: InterviewAssistantService,
      useFactory: (configService: ConfigService, llmService: LLMService) =>
        new InterviewAssistantService(
          {
            model: configService.getOrThrow('llm.assistant.model'),
          },
          llmService,
        ),
      inject: [ConfigService, LLMService],
    },
  ],
  controllers: [InterviewAssistantController],
})
export class InterviewAssistantModule {}
