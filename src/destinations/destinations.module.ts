// import { Module } from '@nestjs/common';
// import { DestinationsController } from './destinations.controller';
// import { DestinationsService } from './destinations.service';
// import { StorageModule } from 'src/storage/storage.module';
// import { DBModule } from 'src/db/db.module';

// @Module({
//   controllers: [DestinationsController],
//   providers: [DestinationsService],
//   imports: [StorageModule, DBModule],
// })
// export class DestinationsModule {}

import { Module } from '@nestjs/common';
import { DestinationsController } from './destinations.controller';
import { DestinationsService } from './destinations.service';
import { StorageModule } from 'src/storage/storage.module';
import { StorageService } from 'src/storage/storage.service';

@Module({
  controllers: [DestinationsController],
  providers: [DestinationsService, StorageService],
  imports: [StorageModule],
})
export class DestinationsModule {}
