import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ConnectionHistoriesService } from './connection-histories.service';
import { ClerkAuthGuard } from 'src/common/auth/clerk-auth.guard';

@Controller('connection-histories')
export class ConnectionHistoriesController {
  constructor(
    private readonly connectionHistoriesService: ConnectionHistoriesService,
  ) {}

  @Get('/all')
  @UseGuards(ClerkAuthGuard)
  async getConnectionHistories(@Request() req: any) {
    console.log('USER ===> ', req.user);
    return this.connectionHistoriesService.get(req.user.sub);
  }
}
