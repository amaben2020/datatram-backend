// // src/storage/storage.service.ts
//@ts-nocheck
// import { Injectable } from '@nestjs/common';
// import { createWriteStream, existsSync, mkdirSync, unlinkSync } from 'fs';
// import { join } from 'path';
// import { storageConfig } from 'src/common/config/storage.config';
// import { v4 as uuidv4 } from 'uuid';
// import { File } from 'multer';

// @Injectable()
// export class StorageService {
//   private readonly config = storageConfig;

//   constructor() {
//     this.ensureUploadDirectoryExists();
//   }

//   private ensureUploadDirectoryExists() {
//     if (!existsSync(this.config.destination)) {
//       mkdirSync(this.config.destination, { recursive: true });
//     }
//   }

//   async storeFile(file: File): Promise<string> {
//     if (!this.config.allowedMimeTypes.includes(file.mimetype)) {
//       throw new Error('File type not allowed');
//     }

//     if (file.size > (this.config.maxFileSize || 1024 * 1024 * 10)) {
//       throw new Error('File size exceeds maximum allowed');
//     }

//     const filename = `${uuidv4()}-${file.originalname}`;
//     const filepath = join(this.config.destination, filename);

//     return new Promise((resolve, reject) => {
//       const writeStream = createWriteStream(filepath);
//       writeStream.write(file.buffer);
//       writeStream.end();

//       writeStream.on('finish', () => resolve(filename));
//       writeStream.on('error', (error) => reject(error));
//     });
//   }

//   deleteFile(filename: string): boolean {
//     try {
//       const filepath = join(this.config.destination, filename);
//       if (existsSync(filepath)) {
//         unlinkSync(filepath);
//         return true;
//       }
//       return false;
//     } catch (error) {
//       return false;
//     }
//   }

//   getFileUrl(filename: string): string {
//     return `/uploads/${filename}`;
//   }
// }

import { Injectable, BadRequestException } from '@nestjs/common';
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { storageConfig } from 'src/common/config/storage.config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly config = storageConfig;

  constructor() {
    this.ensureUploadDirectoryExists();
  }

  private ensureUploadDirectoryExists() {
    if (!existsSync(this.config.destination)) {
      mkdirSync(this.config.destination, { recursive: true });
    }
  }

  async storeFile(file: Express.Multer.File): Promise<string> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided or file is empty');
    }

    if (!this.config.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} not allowed`);
    }

    const maxSize = this.config.maxFileSize || 1024 * 1024 * 10; // 10MB default
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size ${file.size} exceeds maximum allowed ${maxSize}`,
      );
    }

    // Sanitize filename
    const sanitizedOriginalName = file.originalname.replace(
      /[^a-zA-Z0-9.-]/g,
      '_',
    );
    const filename = `${uuidv4()}-${sanitizedOriginalName}`;
    const filepath = join(this.config.destination, filename);

    console.log('Storing file:', filename, 'at:', filepath);

    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(filepath);

      writeStream.on('error', (error) => {
        console.error('Write stream error:', error);
        reject(new BadRequestException('Failed to write file'));
      });

      writeStream.on('finish', () => {
        console.log('File written successfully:', filename);
        resolve(filename);
      });

      writeStream.write(file.buffer);
      writeStream.end();
    });
  }

  deleteFile(filename: string): boolean {
    try {
      const filepath = join(this.config.destination, filename);
      if (existsSync(filepath)) {
        unlinkSync(filepath);
        console.log('Deleted file:', filename);
        return true;
      }
      console.log('File not found for deletion:', filename);
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  getFilePath(filename: string): string {
    return join(this.config.destination, filename);
  }

  fileExists(filename: string): boolean {
    return existsSync(this.getFilePath(filename));
  }
}
