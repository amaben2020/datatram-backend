import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { AuthGuard } from './common/auth/auth.guard';
// import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ClerkService } from './common/auth/clerk/clerk.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ClerkService,
    // {
    //   useClass: AuthGuard,
    //   provide: APP_GUARD,
    // },
  ],
  exports: [ClerkService],
})
export class AppModule {}
