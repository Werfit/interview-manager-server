import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthenticationModule } from './authentication/authentication.module';
import appConfiguration from './configuration/app.configuration';
import databaseConfiguration from './configuration/database.configuration';
import googleConfiguration from './configuration/google.configuration';
import jwtConfiguration from './configuration/jwt.configuration';
import { DatabaseModule } from './database/database.module';
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
      ],
      validate,
    }),
    UserModule,
    DatabaseModule,
    AuthenticationModule,
    OrganizationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
