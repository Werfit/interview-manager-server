import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { AnalyzerModule } from './analyzer/analyzer.module';
import { AuthenticationModule } from './authentication/authentication.module';
import appConfiguration from './configuration/app.configuration';
import databaseConfiguration from './configuration/database.configuration';
import embeddingConfiguration from './configuration/embedding.configuration';
import googleConfiguration from './configuration/google.configuration';
import jwtConfiguration from './configuration/jwt.configuration';
import redisConfiguration from './configuration/redis.configuration';
import socketConfiguration from './configuration/socket.configuration';
import transcriptionConfiguration from './configuration/transcription.configuration';
import { DatabaseModule } from './database/database.module';
import { CandidateModule } from './interview/candidate/candidate.module';
import { InterviewModule } from './interview/interview.module';
import { MediaModule } from './media/media.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrganizationModule } from './organization/organization.module';
import { validate } from './shared/utilities/environment/environment-validator.utility';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfiguration,
        databaseConfiguration,
        jwtConfiguration,
        googleConfiguration,
        redisConfiguration,
        socketConfiguration,
        transcriptionConfiguration,
        embeddingConfiguration,
      ],
      validate: validate,
      envFilePath: ['apps/server/.env'],
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get('redis.url'),
        },
      }),
    }),

    CqrsModule.forRoot(),
    UserModule,
    DatabaseModule,
    AuthenticationModule,
    OrganizationModule,
    InterviewModule,
    CandidateModule,
    MediaModule,
    NotificationsModule,
    AnalyzerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
