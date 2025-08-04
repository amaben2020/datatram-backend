// // src/destinations/destinations.service.ts
// //@ts-nocheck
// import { Injectable, NotFoundException } from '@nestjs/common';
// import { StorageService } from '../storage/storage.service';

// import { eq } from 'drizzle-orm';
// import { DB } from 'src/db/db.service';
// import {
//   CreateDestinationDto,
//   UpdateDestinationDto,
// } from './dto/create-destination.dto';

// @Injectable()
// export class DestinationsService {
//   constructor(
//     private readonly db: DB,
//     private readonly storageService: StorageService,
//   ) {}

//   async findAll(userId: number) {
//     return this.db
//       .select()
//       .from(destinations)
//       .where(eq(destinations.userId, userId));
//   }

//   async findOne(id: number, userId: number) {
//     const [destination] = await this.db
//       .select()
//       .from(destinations)
//       .where(eq(destinations.id, id))
//       .where(eq(destinations.userId, userId));

//     if (!destination) {
//       throw new NotFoundException('Destination not found');
//     }

//     return destination;
//   }

//   async create(
//     createDestinationDto: CreateDestinationDto,
//     userId: number,
//     image?: Express.Multer.File,
//   ) {
//     let imageUrl: string | undefined;

//     if (image) {
//       imageUrl = await this.storageService.storeFile(image);
//     }

//     const [destination] = await this.db
//       .insert(destinations)
//       .values({
//         ...createDestinationDto,
//         image: imageUrl,
//         userId,
//       })
//       .returning();

//     return destination;
//   }

//   async update(
//     id: number,
//     updateDestinationDto: UpdateDestinationDto,
//     userId: number,
//     image?: Express.Multer.File,
//   ) {
//     const existing = await this.findOne(id, userId);

//     let imageUrl = existing.image;

//     if (image) {
//       if (imageUrl) {
//         this.storageService.deleteFile(imageUrl);
//       }
//       imageUrl = await this.storageService.storeFile(image);
//     }

//     const [destination] = await this.db
//       .update(destinations)
//       .set({
//         ...updateDestinationDto,
//         image: imageUrl,
//         updatedAt: new Date(),
//       })
//       .where(eq(destinations.id, id))
//       .where(eq(destinations.userId, userId))
//       .returning();

//     return destination;
//   }

//   async remove(id: number, userId: number) {
//     const existing = await this.findOne(id, userId);

//     if (existing.image) {
//       this.storageService.deleteFile(existing.image);
//     }

//     await this.db
//       .delete(destinations)
//       .where(eq(destinations.id, id))
//       .where(eq(destinations.userId, userId));

//     return { success: true };
//   }
// }

//@ts-nocheck
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { InjectDrizzle } from '@knaadh/nestjs-drizzle-postgres';
import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { and, eq } from 'drizzle-orm';
import {
  CreateDestinationDto,
  UpdateDestinationDto,
} from './dto/create-destination.dto';
import { schema, destinations, users } from 'src/db/schema';
import { NotFoundError } from 'rxjs';

@Injectable()
export class DestinationsService {
  constructor(
    @InjectDrizzle('DB_DEV') private db: typeof schema,
    private readonly storageService: StorageService,
  ) {}

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

    const destinationsData = await this.db
      .select()
      .from(destinations)
      .where(eq(destinations.userId, Number(userId)));

    return destinationsData;
  }

  async findOne(id: number, clerkId: string) {
    const userId = await this.getUserByUserId(clerkId);
    // TODO: Use join to restrict to only user id for specific user
    const [destination] = await this.db
      .select()
      .from(destinations)
      .where(eq(destinations.id, id));
    // .where(eq(destinations.userId, userId));

    if (!destination) {
      throw new NotFoundException('Destination not found');
    }

    return destination;
  }

  async create(
    createDestinationDto: CreateDestinationDto,
    clerkId: string,
    image?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined;

    console.log('IMAGE', image);
    if (image) {
      imageUrl = await this.storageService.storeFile(image);
    }

    const userId = await this.getUserByUserId(clerkId);

    console.log('imageUrl', imageUrl);

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
    clerkId: string,
    image?: Express.Multer.File,
  ) {
    const existing = await this.findOne(id, clerkId);

    console.log('existing', existing);

    let imageUrl = existing.image;

    if (image) {
      if (imageUrl) {
        this.storageService.deleteFile(imageUrl);
      }
      imageUrl = await this.storageService.storeFile(image);
    }

    const [destination = undefined] = await this.db
      .update(destinations)
      .set({
        ...updateDestinationDto,
        image: imageUrl,
        updatedAt: new Date(),
      })
      .where(
        and(eq(destinations.id, id), eq(destinations.userId, existing?.userId)),
      )
      .returning();

    return destination;
  }

  async remove(id: number, clerkId: string) {
    const existing = await this.findOne(id, clerkId);

    if (existing.image) {
      this.storageService.deleteFile(existing.image);
    }

    await this.db.delete(destinations).where(eq(destinations.id, id));
    // .where(eq(destinations.userId, userId));

    return { success: true };
  }
}
