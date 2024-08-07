import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

/**
 * 拦截器 返回统一响应格式
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('TransformInterceptor');
    return next.handle().pipe(
      map((data) => {
        return {
          data: data?.result || data,
          code: 200,
          message: data?.message || '成功',
          ok: true,
        };
      }),
    );
  }
}
