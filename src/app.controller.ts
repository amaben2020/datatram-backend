import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
// import { RolesGuard } from './common/auth/auth.guard';
// import { Roles } from './common/decorators/roles.decorator';
import {
  LoggingInterceptor,
  ResponseWrapperInterceptor,
} from './common/interceptors/logging.interceptors';
import { ClerkAuthGuard } from './common/auth/clerk-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseInterceptors(ResponseWrapperInterceptor)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseInterceptors(LoggingInterceptor, ResponseWrapperInterceptor)
  // @UseGuards(RolesGuard)
  // @Roles(['admin'])
  @UseGuards(ClerkAuthGuard)
  @Get(':id')
  findOne(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ) {
    return id;
  }
}
