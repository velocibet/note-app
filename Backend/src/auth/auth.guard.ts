import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class LoggedInGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.session && request.session.user ) {
      return true;
    }

    throw new UnauthorizedException('Login is required.');
  }
}