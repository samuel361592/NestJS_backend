import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

export const Roles = (...roles: string[]): ReturnType<typeof SetMetadata> =>
  SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as { roles?: string[] };

    console.log('[RolesGuard] user:', user);
    console.log('[RolesGuard] requiredRoles:', requiredRoles);

    if (
      !user ||
      !Array.isArray(user.roles) ||
      !requiredRoles.some((role) => user.roles!.includes(role))
    ) {
      console.warn('[RolesGuard] 無權限');
      throw new ForbiddenException('無權限');
    }

    console.log('[RolesGuard] 通過驗證');
    return true;
  }
}
