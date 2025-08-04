import { Module } from '@nestjs/common';
import { SourcesController } from './sources.controller';
import { SourcesService } from './sources.service';
import { StorageModule } from 'src/storage/storage.module';
import { StorageService } from 'src/storage/storage.service';

@Module({
  controllers: [SourcesController],
  providers: [SourcesService, StorageService],
  imports: [StorageModule],
})
export class SourcesModule {}
