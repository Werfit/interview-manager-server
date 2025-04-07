import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthenticationModule } from './authentication/authentication.module';
import appConfiguration from './configuration/app.configuration';
import databaseConfiguration from './configuration/database.configuration';
import googleConfiguration from './configuration/google.configuration';
import jwtConfiguration from './configuration/jwt.configuration';
import redisConfiguration from './configuration/redis.configuration';
import { DatabaseModule } from './database/database.module';
import { FileUploaderModule } from './file-uploader/file-uploader.module';
import { CandidateModule } from './interview/candidate/candidate.module';
import { InterviewModule } from './interview/interview.module';
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
      ],
      validate,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
        },
      }),
    }),
    UserModule,
    DatabaseModule,
    AuthenticationModule,
    OrganizationModule,
    InterviewModule,
    CandidateModule,
    FileUploaderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
