import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './exception/all-exceptions.filter';
import { HttpExceptionFilter } from './exception/http-exception.filter';
import { PrismaExceptionFilter } from './exception/prisma-exception-filter';
import { TransformInterceptor } from './interceptor/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  // 全局管道
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
  // 全局前缀
  // app.setGlobalPrefix('api');
  // 全局拦截器
  app.useGlobalInterceptors(new TransformInterceptor(), new ClassSerializerInterceptor(app.get(Reflector)));

  // useGlobalFilters 优先级是最后一个是最先执行，所以捕获全部的放第一个，会最后执行
  // 如果只有三个全局过滤器，顺序 useGlobalFilters(3,2,1)
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter(), new PrismaExceptionFilter());
  // 设置静态资源目录 //http://localhost:3000/uploads/avatar.jpg
  app.useStaticAssets(join(__dirname, '/../upload'), { prefix: '/upload' });
  await app.listen(2306);
}
bootstrap();
