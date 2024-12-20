import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './exception/all-exceptions.filter';
import { HttpExceptionFilter } from './exception/http-exception.filter';
import { PrismaExceptionFilter } from './exception/prisma-exception-filter';
import { TransformInterceptor } from './interceptor/transform.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  // 全局管道
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
  // 全局前缀
  // app.setGlobalPrefix('api');
  // 全局拦截器
  app.useGlobalInterceptors(new TransformInterceptor(), new ClassSerializerInterceptor(app.get(Reflector)));

  app.enableCors({
    origin: ['http://localhost:5173','http://8.138.108.50:2309'], // 替换为你的前端地址
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // 如果需要处理 cookie 或认证信息，请设置为 true
  });
  // useGlobalFilters 优先级是最后一个是最先执行，所以捕获全部的放第一个，会最后执行
  // 如果只有三个全局过滤器，顺序 useGlobalFilters(3,2,1)
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter(), new PrismaExceptionFilter());
  // 设置静态资源目录 //http://localhost:3000/uploads/avatar.jpg
  app.useStaticAssets(join(__dirname, '/../upload'), { prefix: '/upload' });

  //创建swagger
  const swaggerOptions = new DocumentBuilder()
    .setTitle('悦购商城管理平台api文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('doc', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 保持授权状态
    },
  });

  await app.listen(2306);
}
bootstrap();
