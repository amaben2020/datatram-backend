//@ts-nocheck

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Request,
  UseGuards,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import {
  CreateConnectionDto,
  UpdateConnectionDto,
} from './dto/create-connection.dto';
import {
  LoggingInterceptor,
  ResponseWrapperInterceptor,
} from 'src/common/interceptors/logging.interceptors';
import { ClerkAuthGuard } from 'src/common/auth/clerk-auth.guard';

@UseInterceptors(LoggingInterceptor, ResponseWrapperInterceptor)
@UseGuards(ClerkAuthGuard)
@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Get('/all')
  async findAll(@Request() req: any) {
    const clerkId = req.user?.id || req.user?.sub;

    console.log(clerkId);

    try {
      const data = await this.connectionsService.findAll(clerkId);

      console.log('CALLED ===>', data);

      return data;
    } catch (error) {
      console.log(error);
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user?.id || req.user?.sub;
    console.log('userId', userId);
    return this.connectionsService.findOne(id, userId);
  }

  @UseGuards(ClerkAuthGuard)
  @Post()
  async create(
    @Body() createConnectionDto: CreateConnectionDto,
    @Request() req: any,
  ) {
    console.log('req ====>', req?.user);
    console.log('CREATE CONNECTION DTO ===>', createConnectionDto);

    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    return this.connectionsService.create(createConnectionDto, userId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConnectionDto: UpdateConnectionDto,
    @Request() req: any,
  ) {
    const clerkId = req.user?.id || req.user?.sub;

    return this.connectionsService.update(id, updateConnectionDto, clerkId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const clerkId = req.user?.id || req.user?.sub;
    return this.connectionsService.remove(id, clerkId);
  }
}
