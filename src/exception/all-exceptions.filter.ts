import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log('AllExceptionsFilter');
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus ? exception.getStatus() : 500;
    const message = exception.message || 'Internal server error';

    // 输出异常信息
    console.error(`Request: ${request.method} ${request.url}`);
    console.error(`Error: ${message}`);

    // 返回响应
    response.status(status).json({
      code: -1,
      data: null,
      message: message,
      ok: false,
    });
  }
}
