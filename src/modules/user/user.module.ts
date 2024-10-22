import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FileModule } from '../file/file.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
  imports:[FileModule]
})
export class UserModule {}
