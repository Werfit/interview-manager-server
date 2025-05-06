import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmbeddingModule } from 'libs/embedding';

import appConfiguration from './configuration/app.configuration';
import databaseConfiguration from './configuration/database.configuration';
import embeddingConfiguration from './configuration/embedding.configuration';
import llmConfiguration from './configuration/llm.configuration';
import { InterviewAssistantModule } from './interview-assistant/interview-assistant.module';
import { validate } from './shared/environment/environment-validator.utility';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfiguration,
        databaseConfiguration,
        embeddingConfiguration,
        llmConfiguration,
      ],
      validate,
      envFilePath: ['apps/assistant/.env'],
    }),
    InterviewAssistantModule,
    EmbeddingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
