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
import { SourcesService } from './sources.service';
import { CreateSourceDto, UpdateSourceDto } from './dto/create-source';
import {
  LoggingInterceptor,
  ResponseWrapperInterceptor,
} from 'src/common/interceptors/logging.interceptors';
import { ClerkAuthGuard } from 'src/common/auth/clerk-auth.guard';

@UseInterceptors(LoggingInterceptor, ResponseWrapperInterceptor)
@UseGuards(ClerkAuthGuard)
@Controller('sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Get('/all')
  async findAll(@Request() req: any) {
    const clerkId = req.user?.id || req.user?.sub;

    console.log(clerkId);

    try {
      const data = await this.sourcesService.findAll(clerkId);

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
    return this.sourcesService.findOne(8, userId);
  }

  @UseGuards(ClerkAuthGuard)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'image', maxCount: 1 },
    ]),
  )
  async create(
    @Body() createSourceDto: any,
    @UploadedFiles()
    files: { file?: Express.Multer.File[]; image?: Express.Multer.File[] },
    @Request() req: any,
  ) {
    console.log('req ====>', req?.user);
    console.log('FILES RECEIVED ===>', files);

    // Extract individual files from the arrays
    const fileUpload = files?.file?.[0];
    const imageUpload = files?.image?.[0];

    console.log('FILE ===>', fileUpload?.originalname, fileUpload?.mimetype);
    console.log('IMAGE ===>', imageUpload?.originalname, imageUpload?.mimetype);

    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    return this.sourcesService.create(
      createSourceDto,
      userId,
      fileUpload,
      imageUpload,
    );
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'image', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSourceDto: any,
    @UploadedFiles()
    files: { file?: Express.Multer.File[]; image?: Express.Multer.File[] },
    @Request() req: any, // Replace with proper auth guard
  ) {
    const clerkId = req.user?.id || req.user?.sub;

    return this.sourcesService.update(
      id,
      updateSourceDto,
      clerkId,
      files?.file?.[0],
      files?.image?.[0],
    );
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const clerkId = req.user?.id || req.user?.sub;
    return this.sourcesService.remove(id, clerkId);
  }
}
