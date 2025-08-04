import { Module } from '@nestjs/common';
import { WebhookController } from './clerk-webhook.controller';
import { UsersModule } from 'src/users/users.module';
import { ClerkWebhookService } from './clerk-webhook.service';

@Module({
  imports: [UsersModule],
  controllers: [WebhookController],
  providers: [ClerkWebhookService],
})
export class WebhookModule {}
