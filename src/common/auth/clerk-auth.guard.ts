// auth/clerk-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { verifyTokenFn } from './verify-token';
import { ClerkService } from './clerk/clerk.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  // constructor(private readonly clerkService: ClerkService) {}
  constructor(private configService: ConfigService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const secretKey = this.configService.get<string>('CLERK_SECRET_KEY') || '';
    console.log(secretKey);
    const issuer = this.configService.get<string>('CLERK_ISSUER_URL') || '';
    console.log('issuer', issuer);
    const request: Request = context.switchToHttp().getRequest();

    const token = request.headers.authorization?.split(' ')[1];

    // console.log(token);

    if (!token) throw new UnauthorizedException('No token found');

    try {
      const user = await verifyTokenFn(token, secretKey, issuer);
      console.log('user ===>', user);
      request['authUser'] = user;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
