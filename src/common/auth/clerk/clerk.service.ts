// src/auth/clerk.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkService {
  constructor(private configService: ConfigService) {}

  async verifyTokenFn(token: string) {
    const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
    console.log(secretKey);
    const issuer = this.configService.get<string>('CLERK_ISSUER_URL') || '';

    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY is not set in environment variables');
    }

    try {
      const payload = await verifyToken(token, {
        secretKey,
        issuer,
      });

      return payload; // contains userId, email, etc.
    } catch (error) {
      console.error('Token verification failed:', error);
      throw error;
    }
  }
}
