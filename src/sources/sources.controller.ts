// // src/sources/sources.controller.ts
//@ts-nocheck
// import {
//   Controller,
//   Get,
//   Post,
//   Put,
//   Delete,
//   Param,
//   Body,
//   UploadedFiles,
//   UseInterceptors,
//   ParseIntPipe,
//   Req,
// } from '@nestjs/common';
// import {
//   FileFieldsInterceptor,
//   FilesInterceptor,
// } from '@nestjs/platform-express';
// import { SourcesService } from './sources.service';
// import { Request } from 'express';
// import { CreateSourceDto, UpdateSourceDto } from './dto/create-source';

// @Controller('sources')
// export class SourcesController {
//   constructor(private readonly sourcesService: SourcesService) {}

//   @Get()
//   findAll(@Req() req: Request) {
//     console.log(req?.user);
//     return this.sourcesService.findAll(req.user.id);
//   }

//   @Get(':id')
//   findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
//     return this.sourcesService.findOne(id, req.user.id);
//   }

//   @Post()
//   @UseInterceptors(
//     FileFieldsInterceptor([
//       { name: 'file', maxCount: 1 },
//       { name: 'image', maxCount: 1 },
//     ]),
//   )
//   // @UseInterceptors(
//   //   FilesInterceptor('files', 2, {
//   //     fileFilter: (req, file, cb) => {
//   //       if (file.fieldname === 'file' || file.fieldname === 'image') {
//   //         cb(null, true);
//   //       } else {
//   //         cb(new Error('Invalid fieldname'), false);
//   //       }
//   //     },
//   //   }),
//   // )
//   async create(
//     @Body() createSourceDto: CreateSourceDto,
//     @UploadedFiles() file: Express.Multer.File,
//     @Req() req: Request,
//   ) {
//     console.log('req', req?.user);
//     // const file = file?.find((f) => f.fieldname === 'file');
//     // const image = file?.find((f) => f.fieldname === 'image');

//     const f = file.fieldname === 'file';
//     const image = file.fieldname === 'image';

//     console.log('FILE ===>', file);
//     console.log('F ===>', f);
//     console.log('IMAGE ===>', image);

//     // return this.sourcesService.create(createSourceDto, req.user?.id, f, image);
//   }

//   @Put(':id')
//   @UseInterceptors(
//     FilesInterceptor('files', 2, {
//       fileFilter: (req, file, cb) => {
//         if (file.fieldname === 'file' || file.fieldname === 'image') {
//           cb(null, true);
//         } else {
//           cb(new Error('Invalid fieldname'), false);
//         }
//       },
//     }),
//   )
//   async update(
//     @Param('id', ParseIntPipe) id: number,
//     @Body() updateSourceDto: UpdateSourceDto,
//     @UploadedFiles() files: Express.Multer.File[],
//     @Req() req: Request,
//   ) {
//     const file = files?.find((f) => f.fieldname === 'file');
//     const image = files?.find((f) => f.fieldname === 'image');

//     return this.sourcesService.update(
//       id,
//       updateSourceDto,
//       req.user.id,
//       file,
//       image,
//     );
//   }

//   @Delete(':id')
//   remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
//     return this.sourcesService.remove(id, req.user.id);
//   }
// }

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

@Controller('sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'image', maxCount: 1 },
    ]),
  )
  async create(
    @Body() createSourceDto: CreateSourceDto,
    @UploadedFiles()
    files: { file?: Express.Multer.File[]; image?: Express.Multer.File[] },
    @Request() req: any, // Replace with proper auth guard
  ) {
    console.log('req', req?.user);
    console.log('FILES RECEIVED ===>', files);

    // Extract individual files from the arrays
    const fileUpload = files?.file?.[0];
    const imageUpload = files?.image?.[0];

    console.log('FILE ===>', fileUpload?.originalname, fileUpload?.mimetype);
    console.log('IMAGE ===>', imageUpload?.originalname, imageUpload?.mimetype);

    const userId = req.user?.id || 2; // Remove the fallback to 1

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
    @Body() updateSourceDto: UpdateSourceDto,
    @UploadedFiles()
    files: { file?: Express.Multer.File[]; image?: Express.Multer.File[] },
    @Request() req: any, // Replace with proper auth guard
  ) {
    const userId = req.user?.id || 1; // Get from authenticated user

    return this.sourcesService.update(
      id,
      updateSourceDto,
      userId,
      files?.file?.[0],
      files?.image?.[0],
    );
  }

  @Get()
  async findAll(@Request() req: any) {
    const userId = req.user?.id || 1;
    return this.sourcesService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user?.id || 1;
    return this.sourcesService.findOne(id, userId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user?.id || 1;
    return this.sourcesService.remove(id, userId);
  }
}
