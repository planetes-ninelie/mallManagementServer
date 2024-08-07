import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Cache } from 'cache-manager';
import { CacheToken } from 'src/common/enum/cache';
import { md5 } from 'src/utils';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * TypeScript 中的函数 `login` 通过检查用户名和密码、生成 JWT 令牌并将其设置为一天后过期来异步验证用户身份。
   * @param {string} username - `username` 参数是一个字符串，代表尝试登录的用户的用户名。
   * @param {string} password - `login` 函数中的 `password`
   * 参数是一个字符串，表示用户在登录过程中提供的密码输入。它用于通过将其与数据库中存储的相应用户名的哈希密码进行比较来验证用户身份。
   * @returns `login` 函数返回一个具有以下属性的对象：
   * - `accessToken`：为用户生成的 JWT 令牌
   * - `expires`：null（未在提供的代码中设置）
   * - `refreshToken`：null（未在提供的代码中设置）
   * - `tokenType`：'Bearer'
   */
  async login(username: string, password: string) {
    const user = await this.userService.findByUsername(username);

    const md5Password = md5(password);

    if (!user || user?.password !== md5Password) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const payload = { userId: user.id, username: user.username };
    const token = await this.jwtService.signAsync(payload);

    // 设置token 一天后过期
    // ttl是毫秒，需要*1000转成秒
    await this.cacheManager.set(token, CacheToken.ENABLE, 60 * 60 * 24 * 1000); // 60 * 60 * 24 * 1000

    return token;
  }

  /**
   * TypeScript 中的 `logout` 函数从缓存中删除一个 token 并返回 null。
   * @param token - `logout` 函数中的 `token`
   * 参数通常是一个唯一标识符或密钥，代表用户的身份验证令牌。此令牌用于在访问受保护的资源或在系统内执行操作时验证用户的身份和权限。在提供的代码片段的上下文中，`
   * @returns 无效的
   */
  async logout(token) {
    // 删除token
    await this.cacheManager.del(token);
    return null;
  }
}
