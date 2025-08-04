// auth/clerk-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { verifyTokenFn } from './verify-token';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  // constructor(private readonly clerkService: ClerkService) {}
  constructor(private configService: ConfigService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const secretKey = this.configService.get<string>('CLERK_SECRET_KEY') || '';

    const issuer = this.configService.get<string>('CLERK_ISSUER_URL') || '';

    const request: Request = context.switchToHttp().getRequest();

    const token = request.headers.authorization?.split(' ')[1];

    if (!token) throw new UnauthorizedException('No token found');

    try {
      const user = await verifyTokenFn(token, secretKey, issuer);
      console.log('user ===>', user);
      // user is the user object atteched to request
      request['user'] = user;

      console.log('REQUEST USER ===> ', request?.user);
      return true;
    } catch (err) {
      console.log('ERR', err);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
