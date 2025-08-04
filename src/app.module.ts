/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { AuthGuard } from './common/auth/auth.guard';
// import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ClerkService } from './common/auth/clerk/clerk.service';
import { DrizzlePostgresModule } from '@knaadh/nestjs-drizzle-postgres';
import { schema } from './db/schema';
import { SourcesModule } from './sources/sources.module';
import { DestinationsModule } from './destinations/destinations.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { WebhookModule } from './webhooks/webhook.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    DrizzlePostgresModule.register({
      tag: 'DB_DEV',
      postgres: {
        url: 'postgresql://neondb_owner:npg_dfycan9Q1xbt@ep-tiny-violet-advkhk4b-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
      },
      config: { schema: { ...schema } },
    }),
    SourcesModule,
    DestinationsModule,
    WebhookModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ClerkService,
    // Use global auth
    // {
    //   useClass: AuthGuard,
    //   provide: APP_GUARD,
    // },
  ],
  exports: [ClerkService],
})
export class AppModule {}
