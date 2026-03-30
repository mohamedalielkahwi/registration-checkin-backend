import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // If it's public, allow access without token
    if (isPublic) {
      return true;
    }

    // Otherwise, check for token (your existing logic)
    const request = context.switchToHttp().getRequest();
    console.log(request.headers.authorization);
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) return false;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      return decoded.code === process.env.MIC_CODE;
    } catch (error) {
      return false;
    }
  }
}