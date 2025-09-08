import { Module } from '@nestjs/common';
import { ConnectionHistoriesController } from './connection-histories.controller';
import { ConnectionHistoriesService } from './connection-histories.service';

@Module({
  controllers: [ConnectionHistoriesController],
  providers: [ConnectionHistoriesService]
})
export class ConnectionHistoriesModule {}
