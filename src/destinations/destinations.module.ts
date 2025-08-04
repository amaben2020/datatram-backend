import { Module } from '@nestjs/common';
import { DestinationsController } from './destinations.controller';
import { DestinationsService } from './destinations.service';
import { StorageModule } from 'src/storage/storage.module';
import { DB } from 'src/db/db.service';
import { DBModule } from 'src/db/db.module';

@Module({
  controllers: [DestinationsController],
  providers: [DestinationsService],
  imports: [StorageModule, DBModule],
})
export class DestinationsModule {}
