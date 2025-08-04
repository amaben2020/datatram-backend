//@ts-nocheck
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { InjectDrizzle } from '@knaadh/nestjs-drizzle-postgres';
import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { and, eq } from 'drizzle-orm';
import { CreateSourceDto, UpdateSourceDto } from './dto/create-source';
import { schema, sources, users } from 'src/db/schema';
import { NotFoundError } from 'rxjs';

@Injectable()
export class SourcesService {
  constructor(
    // private readonly db: DB,
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

    const sourcesData = await this.db
      .select()
      .from(sources)
      .where(eq(sources.userId, Number(userId)));

    return sourcesData;
  }

  async findOne(id: number, clerkId: string) {
    const userId = await this.getUserByUserId(clerkId);
    // TODO: Use join to restrict to only user id for specific user
    const [source] = await this.db
      .select()
      .from(sources)
      .where(eq(sources.id, id));
    // .where(eq(sources.userId, userId));

    if (!source) {
      throw new NotFoundException('Source not found');
    }

    return source;
  }

  async create(
    createSourceDto: CreateSourceDto,
    clerkId: string,
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

    const userId = await this.getUserByUserId(clerkId);

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
    clerkId: string,
    file?: Express.Multer.File,
    image?: Express.Multer.File,
  ) {
    const existing = await this.findOne(id, clerkId);

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
