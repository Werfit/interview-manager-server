import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmbeddingModule } from 'libs/embedding';
import { EmbeddingDatabaseModule } from 'libs/embedding-database';

import { InterviewAssistantController } from './interview-assistant.controller';
import { InterviewAssistantService } from './interview-assistant.service';

@Module({
  imports: [EmbeddingModule, EmbeddingDatabaseModule],
  providers: [
    {
      provide: InterviewAssistantService,
      useFactory: (configService: ConfigService) =>
        new InterviewAssistantService({
          model: configService.getOrThrow('llm.model'),
          url: configService.getOrThrow('llm.url'),
        }),
      inject: [ConfigService],
    },
  ],
  controllers: [InterviewAssistantController],
})
export class InterviewAssistantModule {}
