import { CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { verifySessionToken, type SessionUser } from './token.util';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: SessionUser['role'][]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string>; user?: SessionUser }>();
    const header = request.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    const user = verifySessionToken(token, this.config.get<string>('JWT_SECRET') ?? 'change-me');

    if (!user) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const roles = this.reflector.getAllAndOverride<SessionUser['role'][]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (roles?.length && !roles.includes(user.role)) {
      throw new UnauthorizedException('Admin permission is required');
    }

    request.user = user;
    return true;
  }
}
