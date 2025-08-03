/* eslint-disable @typescript-eslint/no-unsafe-call */
import { InjectDrizzle } from '@knaadh/nestjs-drizzle-postgres';
import { Injectable } from '@nestjs/common';

import { schema } from 'src/db/schema';

@Injectable()
export class SourcesService {
  constructor(@InjectDrizzle('DB_DEV') private db: typeof schema) {}
  getHello() {
    const data = this.db.users.name;

    return data;
  }
}
