//@ts-nocheck
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { InjectDrizzle } from '@knaadh/nestjs-drizzle-postgres';
import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import {
  CreateConnectionDto,
  UpdateConnectionDto,
} from './dto/create-connection.dto';
import {
  schema,
  connections,
  users,
  sources,
  destinations,
} from 'src/db/schema';
import { NotFoundError } from 'rxjs';

@Injectable()
export class ConnectionsService {
  constructor(@InjectDrizzle('DB_DEV') private db: typeof schema) {}

  async getUserByUserId(clerkId: string) {
    const userId = await this.db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });
    return userId?.id;
  }

  async findAll(clerkId: string) {
    console.log('USER ID', clerkId);
    const userId = await this.getUserByUserId(clerkId);

    console.log('USER ID FIND ALL', userId);

    if (!userId) throw NotFoundError('User not found');

    // Get connections with related sources and destinations that belong to the user
    const connectionsData = await this.db
      .select({
        id: connections.id,
        sourceId: connections.sourceId,
        destinationId: connections.destinationId,
        sourceName: sources.name,
        destinationName: destinations.name,
      })
      .from(connections)
      .leftJoin(sources, eq(connections.sourceId, sources.id))
      .leftJoin(destinations, eq(connections.destinationId, destinations.id))
      .where(
        and(
          eq(sources.userId, Number(userId)),
          eq(destinations.userId, Number(userId)),
        ),
      );

    return connectionsData;
  }

  async findOne(id: number, clerkId: string) {
    const userId = await this.getUserByUserId(clerkId);

    const [connection] = await this.db
      .select({
        id: connections.id,
        sourceId: connections.sourceId,
        destinationId: connections.destinationId,
        sourceName: sources.name,
        destinationName: destinations.name,
      })
      .from(connections)
      .leftJoin(sources, eq(connections.sourceId, sources.id))
      .leftJoin(destinations, eq(connections.destinationId, destinations.id))
      .where(
        and(
          eq(connections.id, id),
          eq(sources.userId, Number(userId)),
          eq(destinations.userId, Number(userId)),
        ),
      );

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    return connection;
  }

  async create(createConnectionDto: CreateConnectionDto, clerkId: string) {
    const userId = await this.getUserByUserId(clerkId);

    // Verify that both source and destination belong to the user
    const source = await this.db.query.sources.findFirst({
      where: and(
        eq(sources.id, createConnectionDto.sourceId),
        eq(sources.userId, Number(userId)),
      ),
    });

    const destination = await this.db.query.destinations.findFirst({
      where: and(
        eq(destinations.id, createConnectionDto.destinationId),
        eq(destinations.userId, Number(userId)),
      ),
    });

    if (!source) {
      throw new NotFoundException(
        'Source not found or does not belong to user',
      );
    }

    if (!destination) {
      throw new NotFoundException(
        'Destination not found or does not belong to user',
      );
    }

    const [connection] = await this.db
      .insert(connections)
      .values({
        ...createConnectionDto,
      })
      .returning();

    return connection;
  }

  async update(
    id: number,
    updateConnectionDto: UpdateConnectionDto,
    clerkId: string,
  ) {
    const existing = await this.findOne(id, clerkId);
    const userId = await this.getUserByUserId(clerkId);

    console.log('existing', existing);

    // If updating sourceId or destinationId, verify they belong to the user
    if (updateConnectionDto.sourceId) {
      const source = await this.db.query.sources.findFirst({
        where: and(
          eq(sources.id, updateConnectionDto.sourceId),
          eq(sources.userId, Number(userId)),
        ),
      });

      if (!source) {
        throw new NotFoundException(
          'Source not found or does not belong to user',
        );
      }
    }

    if (updateConnectionDto.destinationId) {
      const destination = await this.db.query.destinations.findFirst({
        where: and(
          eq(destinations.id, updateConnectionDto.destinationId),
          eq(destinations.userId, Number(userId)),
        ),
      });

      if (!destination) {
        throw new NotFoundException(
          'Destination not found or does not belong to user',
        );
      }
    }

    const [connection = undefined] = await this.db
      .update(connections)
      .set({
        ...updateConnectionDto,
      })
      .where(eq(connections.id, id))
      .returning();

    return connection;
  }

  async remove(id: number, clerkId: string) {
    const existing = await this.findOne(id, clerkId);

    await this.db.delete(connections).where(eq(connections.id, id));

    return { success: true };
  }
}
