// src/db/db.service.ts
import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { schema } from './schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DB {
  private db: ReturnType<typeof drizzle<typeof schema>>;
  constructor(private configService: ConfigService) {}

  get query() {
    const connectionString =
      this.configService.get<string>('DATABASE_URL') || '';

    const pool = new Pool({
      connectionString,
    });

    this.db = drizzle(pool, { schema });
    return this.db;
  }
}
