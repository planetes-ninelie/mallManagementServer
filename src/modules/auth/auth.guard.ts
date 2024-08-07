import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Cache } from 'cache-manager';
import { extractTokenFromHeader } from 'src/utils';
import { jwtConstants } from './constants';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) {
      // 加上@Public()的接口直接放行
      return true;
    }

    const request = context.switchToHttp().getRequest();

    if (!request.headers.token) {
      throw new UnauthorizedException('token无效');
    }

    const token = extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    const cacheToken = await this.cacheManager.get(token);

    if (!cacheToken) {
      throw new UnauthorizedException('token已过期');
    }

    try {
      request['user'] = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
    } catch (e) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
