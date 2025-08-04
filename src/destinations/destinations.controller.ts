//@ts-nocheck

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
  Request,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DestinationsService } from './destinations.service';
import {
  CreateDestinationDto,
  UpdateDestinationDto,
} from './dto/create-destination.dto';
import {
  LoggingInterceptor,
  ResponseWrapperInterceptor,
} from 'src/common/interceptors/logging.interceptors';
import { ClerkAuthGuard } from 'src/common/auth/clerk-auth.guard';

// @UseInterceptors(LoggingInterceptor, ResponseWrapperInterceptor)
@UseGuards(ClerkAuthGuard)
@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get('/all')
  async findAll(@Request() req: any) {
    const clerkId = req.user?.id || req.user?.sub;

    console.log(clerkId);

    try {
      const data = await this.destinationsService.findAll(clerkId);

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
    return this.destinationsService.findOne(id, userId);
  }

  @UseGuards(ClerkAuthGuard)
  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  async create(
    @Body() createDestinationDto: any,
    @UploadedFiles()
    files: { image?: Express.Multer.File[] },
    @Request() req: any,
  ) {
    console.log('req ====>', req?.user);
    console.log('FILES RECEIVED ===>', files);

    // Extract individual files from the arrays
    const imageUpload = files?.image?.[0];

    console.log('IMAGE ===>', imageUpload?.originalname, imageUpload?.mimetype);

    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    return this.destinationsService.create(
      createDestinationDto,
      userId,
      imageUpload,
    );
  }

  @Patch(':id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDestinationDto: any,
    @UploadedFiles()
    files: { image?: Express.Multer.File[] },
    @Request() req: any, // Replace with proper auth guard
  ) {
    const clerkId = req.user?.id || req.user?.sub;

    return this.destinationsService.update(
      id,
      updateDestinationDto,
      clerkId,
      files?.image?.[0],
    );
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const clerkId = req.user?.id || req.user?.sub;
    return this.destinationsService.remove(id, clerkId);
  }
}
