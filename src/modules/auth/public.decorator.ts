import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
// 加上这个公开装饰器，就可以绕过守卫
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
