import { verifyToken } from '@clerk/clerk-sdk-node';
import { UnauthorizedException } from '@nestjs/common';

export async function verifyTokenFn(
  token: string,
  secretKey: string,
  issuer: string,
) {
  if (!secretKey || !issuer) {
    throw new Error('CLERK_SECRET_KEY environment variable is required');
  }

  try {
    const payload = await verifyToken(token, {
      secretKey,
      issuer,
    });
    console.log(payload);
    if (!payload) {
      throw new UnauthorizedException('Token expired');
    }
    return payload; // includes userId, email, etc.
  } catch (error) {
    console.log(error);
    throw new UnauthorizedException('Token expired');
  }
}
