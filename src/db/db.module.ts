import { Module } from '@nestjs/common';
import { DB } from './db.service';

@Module({
  imports: [],
  exports: [DB],
  providers: [DB],
})
export class DBModule {}
