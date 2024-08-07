import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    console.log('PrismaExceptionFilter');

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // console.log(exception);

    let message: string;
    if (exception.code === 'P2025') {
      message = '未找到的记录';
    } else if (exception.code === 'P2002') {
      message = '记录已存在';
    } else {
      message = '服务器错误';
    }

    response.status(500).json({
      code: -1,
      data: null,
      message: message,
      ok: false,
    });
  }
}
