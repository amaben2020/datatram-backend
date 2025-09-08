import { Module } from '@nestjs/common';
import { ConnectionsController } from './connections.controller';
import { ConnectionsService } from './connections.service';
import { ConnectionHistoriesService } from 'src/connection-histories/connection-histories.service';

@Module({
  controllers: [ConnectionsController],
  providers: [ConnectionsService, ConnectionHistoriesService],
})
export class ConnectionsModule {}
