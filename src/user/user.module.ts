import { Global, Module } from '@nestjs/common';
import { OrganizationModule } from 'src/organization/organization.module';

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
