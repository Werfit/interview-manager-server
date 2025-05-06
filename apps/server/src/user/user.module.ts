import { Global, Module } from '@nestjs/common';
import { OrganizationModule } from 'apps/server/organization/organization.module';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Global()
@Module({
  imports: [OrganizationModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
