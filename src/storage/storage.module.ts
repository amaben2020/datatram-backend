import { Module } from '@nestjs/common';

import { StorageService } from 'src/storage/storage.service';

@Module({
  imports: [],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
