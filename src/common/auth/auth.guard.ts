import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());

    if (!roles.includes('admin')) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    // 🔧 MOCK A USER for testing (JWT roles)
    request.user = {
      id: 1,
      username: 'adminUser',
      roles: ['admin'],
    };

    const user = request.user;

    console.log(user);
    // return matchRoles(roles, user.roles);

    if (!user.roles || !user.roles.includes('admin')) {
      throw new BadRequestException();
    }

    return true;
  }
}
