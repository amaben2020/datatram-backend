/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle } from '@knaadh/nestjs-drizzle-postgres';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema, users } from 'src/db/schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectDrizzle('DB_DEV') private db: NodePgDatabase<typeof schema>,
  ) {}
  async createFromClerk(userData: CreateUserFromClerkDto) {
    // Check if user already exists
    const existingUser = await this.findByClerkId(userData.clerkId);
    if (existingUser) {
      console.log('User already exists:', userData.clerkId);
      return existingUser;
    }

    const [user] = await this.db
      .insert(users)
      .values({
        clerkId: userData.clerkId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        imageUrl: userData.imageUrl,
        username: userData.username,
        name:
          `${userData.firstName || ''} ${userData.lastName || ''}`.trim() ||
          userData.username ||
          userData.email,
      })
      .returning();

    console.log('Created user:', user);
    return user;
  }

  async updateFromClerk(clerkId: string, userData: UpdateUserFromClerkDto) {
    const [user] = await this.db
      .update(users)
      .set({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        imageUrl: userData.imageUrl,
        username: userData.username,
        name:
          `${userData.firstName || ''} ${userData.lastName || ''}`.trim() ||
          userData.username ||
          userData.email,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, clerkId))
      .returning();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByClerkId(clerkId: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId));

    return user;
  }

  async deleteByClerkId(clerkId: string) {
    await this.db.delete(users).where(eq(users.clerkId, clerkId));
  }
}

export interface CreateUserFromClerkDto {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  username?: string;
}

export interface UpdateUserFromClerkDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  username?: string;
}
