import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { redisStore } from 'cache-manager-redis-yet';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';

@Module({
  // 导入user模块，在AuthService就可以引入user模块的service
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      // 一天后过期
      signOptions: { expiresIn: 24 * 60 * 60 + 's' },
    }),
    CacheModule.register(
      // 如果不要redis，可以注释掉，使用内存缓存
      // {
      //   store: redisStore,

      //   // Store-specific configuration:
      //   host: 'localhost',
      //   port: 6379,
      // },
    ),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      // 设置全局守卫，包括其他模块下的接口
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule { }
