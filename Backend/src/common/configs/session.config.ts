import * as session from 'express-session';
import { InternalServerErrorException } from '@nestjs/common';

export const getSessionConfig = (): session.SessionOptions => {
  const secret = process.env.SESSION_SECRET!;

  // 실제 배포 환경에서 세션 키가 없을 때 오류 발생
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new InternalServerErrorException('SESSION_SECRET is required in production');
  }

  return {
    secret,
    resave: false,
    saveUninitialized: false,
    // 엄
    name: 'umjunsik_auth',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 24시간
    },
    proxy: process.env.NODE_ENV === 'production',
  };
};