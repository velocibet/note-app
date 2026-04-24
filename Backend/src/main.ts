import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import session from 'express-session';
import { AppModule } from './app.module';
import { getSessionConfig } from './common/configs/session.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);

  app.enableCors({
    origin: process.env.ORIGIN,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const firstError = errors[0];
        const constraints = firstError.constraints;
        const message = constraints ? Object.values(constraints)[0] : '유효성 검사 실패';
        return new BadRequestException(message);
      },
    }),
  );

  // 전역 api 인터셉터
  app.setGlobalPrefix('api');

  // 세션 적용
  app.use(session(getSessionConfig()));

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
