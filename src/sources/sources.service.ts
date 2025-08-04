//@ts-nocheck
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { InjectDrizzle } from '@knaadh/nestjs-drizzle-postgres';
import { Injectable } from '@nestjs/common';

// import { schema } from 'src/db/schema';

// @Injectable()
// export class SourcesService {
//   constructor(@InjectDrizzle('DB_DEV') private db: typeof schema) {}
//   getHello() {
//     const data = this.db.users.name;

//     return data;
//   }
// }

// src/sources/sources.service.ts
import { NotFoundException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
// import { sources } from '../schema';
import { eq } from 'drizzle-orm';
import { CreateSourceDto, UpdateSourceDto } from './dto/create-source';
import { schema, sources } from 'src/db/schema';
// import { DB } from '../db/db.service';

@Injectable()
export class SourcesService {
  constructor(
    // private readonly db: DB,
    @InjectDrizzle('DB_DEV') private db: typeof schema,
    private readonly storageService: StorageService,
  ) {}

  async findAll(userId: number) {
    return this.db.select().from(sources).where(eq(sources.userId, userId));
  }

  async findOne(id: number, userId: number) {
    const [source] = await this.db
      .select()
      .from(sources)
      .where(eq(sources.id, id))
      .where(eq(sources.userId, userId));

    if (!source) {
      throw new NotFoundException('Source not found');
    }

    return source;
  }

  async create(
    createSourceDto: CreateSourceDto,
    userId: number,
    file?: Express.Multer.File,
    image?: Express.Multer.File,
  ) {
    let fileUrl: string | undefined;
    let imageUrl: string | undefined;

    console.log('FILE', file);
    if (file) {
      fileUrl = await this.storageService.storeFile(file);
    }

    if (image) {
      imageUrl = await this.storageService.storeFile(image);
    }

    console.log('fileUrl', fileUrl);
    console.log('fileUrl', imageUrl);

    const [source] = await this.db
      .insert(sources)
      .values({
        ...createSourceDto,
        file: fileUrl,
        image: imageUrl,
        userId,
      })
      .returning();

    return source;
  }

  async update(
    id: number,
    updateSourceDto: UpdateSourceDto,
    userId: number,
    file?: Express.Multer.File,
    image?: Express.Multer.File,
  ) {
    const existing = await this.findOne(id, userId);

    let fileUrl = existing.file;
    let imageUrl = existing.image;

    if (file) {
      if (fileUrl) {
        this.storageService.deleteFile(fileUrl);
      }
      fileUrl = await this.storageService.storeFile(file);
    }

    if (image) {
      if (imageUrl) {
        this.storageService.deleteFile(imageUrl);
      }
      imageUrl = await this.storageService.storeFile(image);
    }

    const [source] = await this.db
      .update(sources)
      .set({
        ...updateSourceDto,
        file: fileUrl,
        image: imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(sources.id, id))
      .where(eq(sources.userId, userId))
      .returning();

    return source;
  }

  async remove(id: number, userId: number) {
    const existing = await this.findOne(id, userId);

    if (existing.file) {
      this.storageService.deleteFile(existing.file);
    }

    if (existing.image) {
      this.storageService.deleteFile(existing.image);
    }

    await this.db
      .delete(sources)
      .where(eq(sources.id, id))
      .where(eq(sources.userId, userId));

    return { success: true };
  }
}
