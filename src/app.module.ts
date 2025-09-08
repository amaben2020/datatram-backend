/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { AuthGuard } from './common/auth/auth.guard';
// import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClerkService } from './common/auth/clerk/clerk.service';
import { DrizzlePostgresModule } from '@knaadh/nestjs-drizzle-postgres';
import { schema } from './db/schema';
import { SourcesModule } from './sources/sources.module';
import { DestinationsModule } from './destinations/destinations.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { WebhookModule } from './webhooks/webhook.module';
import { UsersModule } from './users/users.module';
import { ConnectionsModule } from './connections/connections.module';
import { ConnectionHistoriesModule } from './connection-histories/connection-histories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    DrizzlePostgresModule.registerAsync({
      tag: 'DB_DEV',
      useFactory: (config: ConfigService) => {
        const dbUrl = config.get<string>('DATABASE_URL');

        if (!dbUrl) {
          throw new Error('DATABASE_URL is not defined in environment');
        }

        return {
          postgres: {
            url: dbUrl,
          },
          config: { schema: { ...schema } },
        };
      },
      inject: [ConfigService],
    }),
    SourcesModule,
    DestinationsModule,
    WebhookModule,
    UsersModule,
    ConnectionsModule,
    ConnectionHistoriesModule,
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
