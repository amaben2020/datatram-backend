// src/db/db.service.ts
import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { schema } from './schema';

@Injectable()
export class DB {
  private readonly db: ReturnType<typeof drizzle<typeof schema>>;

  constructor() {
    const pool = new Pool({
      connectionString:
        'postgresql://neondb_owner:npg_dfycan9Q1xbt@ep-tiny-violet-advkhk4b-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    });

    this.db = drizzle(pool, { schema });
  }

  get query() {
    return this.db;
  }
}
