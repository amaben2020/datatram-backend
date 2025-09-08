//@ts-nocheck
import { InjectDrizzle } from '@knaadh/nestjs-drizzle-postgres';
import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import {
  schema,
  connectionHistories,
  connections,
  sources,
  users,
  destinations,
} from 'src/db/schema';

export interface CreateConnectionHistoryDto {
  connectionId: number;
  status: 'pending' | 'success' | 'failure';
  metadata?: any;
}

export interface UpdateConnectionHistoryDto {
  status?: 'pending' | 'success' | 'failure';
  metadata?: any;
}

@Injectable()
export class ConnectionHistoriesService {
  constructor(@InjectDrizzle('DB_DEV') private db: typeof schema) {}

  async getUserByUserId(clerkId: string) {
    const userId = await this.db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });
    return userId?.id;
  }

  /**
   * Create a new connection history record
   */
  async create(
    createDto: CreateConnectionHistoryDto,
    clerkId: string,
  ): Promise<number> {
    const userId = await this.getUserByUserId(clerkId);

    console.log('user', userId);

    if (!userId) {
      throw new NotFoundException('User not found');
    }

    // Get the connection and verify it belongs to the user
    const connection = await this.db
      .select({
        id: connections.id,
        sourceId: connections.sourceId,
        destinationId: connections.destinationId,
      })
      .from(connections)
      .leftJoin(sources, eq(connections.sourceId, sources.id))
      .where(
        and(
          eq(connections.id, createDto.connectionId),
          eq(sources.userId, Number(userId)),
        ),
      )
      .limit(1);

    console.log('connection', connection);

    if (!connection?.length) {
      throw new NotFoundException(
        'Connection not found or does not belong to user',
      );
    }

    const [history] = await this.db
      .insert(connectionHistories)
      .values({
        connectionId: createDto.connectionId,
        sourceId: connection[0].sourceId,
        destinationId: connection[0].destinationId,
        status: createDto.status,
        metadata: createDto.metadata || {},
      })
      .returning();

    console.log('HISTORY', history);

    return history.id;
  }

  // Todo: filter by user and expand schema
  async get(clerkId: string): Promise<ConnectionHistory[]> {
    const user = await this.getUserByUserId(clerkId);
    console.log('user', user);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Debug: Check what user object contains
    console.log('User object keys:', Object.keys(user));
    console.log('User id:', user.id);

    // Simple approach without joins first to test
    const histories = await this.db
      .select()
      .from(connectionHistories)
      .orderBy(desc(connectionHistories.attemptedAt));

    console.log('HISTORIES (all):', histories);

    // If you need to filter by user, we need to understand your schema better
    // For now, return all histories to test the basic query works
    return histories;
  }
  /**
   * Update an existing connection history record
   */
  async update(
    historyId: number,
    updateDto: UpdateConnectionHistoryDto,
    clerkId: string,
  ) {
    const userId = await this.getUserByUserId(clerkId);

    if (!userId) {
      throw new NotFoundException('User not found');
    }

    // Verify the history record exists and belongs to the user
    const existingHistory = await this.db
      .select({
        id: connectionHistories.id,
      })
      .from(connectionHistories)
      .leftJoin(sources, eq(connectionHistories.sourceId, sources.id))
      .where(
        and(
          eq(connectionHistories.id, historyId),
          eq(sources.userId, Number(userId)),
        ),
      )
      .limit(1);

    if (!existingHistory.length) {
      throw new NotFoundException('Connection history not found');
    }

    const [updatedHistory = undefined] = await this.db
      .update(connectionHistories)
      .set({
        status: updateDto.status,
        metadata: updateDto.metadata,
      })
      .where(eq(connectionHistories.id, historyId))
      .returning();

    console.log('updatedHistory', updatedHistory);

    return updatedHistory;
  }

  /**
   * Helper method to create connection history (simplified for BigQuery usage)
   */
  async createConnectionHistory(
    connectionId: number,
    status: 'pending' | 'success' | 'failure',
    metadata: any,
    clerkId: string,
  ): Promise<number> {
    return this.create(
      {
        connectionId,
        status,
        metadata,
      },
      clerkId,
    );
  }

  /**
   * Helper method to update connection history (simplified for BigQuery usage)
   */
  async updateConnectionHistory(
    historyId: number,
    status: 'pending' | 'success' | 'failure',
    metadata: any,
    clerkId: string,
  ) {
    return this.update(historyId, { status, metadata }, clerkId);
  }
}
