// src/destinations/destinations.service.ts
//@ts-nocheck
import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';

import { eq } from 'drizzle-orm';
import { DB } from 'src/db/db.service';
import {
  CreateDestinationDto,
  UpdateDestinationDto,
} from './dto/create-destination.dto';

@Injectable()
export class DestinationsService {
  constructor(
    private readonly db: DB,
    private readonly storageService: StorageService,
  ) {}

  async findAll(userId: number) {
    return this.db
      .select()
      .from(destinations)
      .where(eq(destinations.userId, userId));
  }

  async findOne(id: number, userId: number) {
    const [destination] = await this.db
      .select()
      .from(destinations)
      .where(eq(destinations.id, id))
      .where(eq(destinations.userId, userId));

    if (!destination) {
      throw new NotFoundException('Destination not found');
    }

    return destination;
  }

  async create(
    createDestinationDto: CreateDestinationDto,
    userId: number,
    image?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined;

    if (image) {
      imageUrl = await this.storageService.storeFile(image);
    }

    const [destination] = await this.db
      .insert(destinations)
      .values({
        ...createDestinationDto,
        image: imageUrl,
        userId,
      })
      .returning();

    return destination;
  }

  async update(
    id: number,
    updateDestinationDto: UpdateDestinationDto,
    userId: number,
    image?: Express.Multer.File,
  ) {
    const existing = await this.findOne(id, userId);

    let imageUrl = existing.image;

    if (image) {
      if (imageUrl) {
        this.storageService.deleteFile(imageUrl);
      }
      imageUrl = await this.storageService.storeFile(image);
    }

    const [destination] = await this.db
      .update(destinations)
      .set({
        ...updateDestinationDto,
        image: imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(destinations.id, id))
      .where(eq(destinations.userId, userId))
      .returning();

    return destination;
  }

  async remove(id: number, userId: number) {
    const existing = await this.findOne(id, userId);

    if (existing.image) {
      this.storageService.deleteFile(existing.image);
    }

    await this.db
      .delete(destinations)
      .where(eq(destinations.id, id))
      .where(eq(destinations.userId, userId));

    return { success: true };
  }
}
