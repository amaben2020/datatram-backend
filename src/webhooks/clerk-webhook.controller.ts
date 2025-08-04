import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { Webhook } from 'svix';
import { ClerkWebhookService } from './clerk-webhook.service';
import { ConfigService } from '@nestjs/config';

@Controller('webhooks')
export class WebhookController {
  constructor(
    private readonly clerkWebHookService: ClerkWebhookService,
    private readonly configService: ConfigService,
  ) {}

  @Post('clerk')
  async handleClerkWebhook(
    @Body() body: any,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ) {
    try {
      const webhookSecret =
        this.configService.get<string>('CLERK_WEBHOOK_SECRET') || '';

      if (!webhookSecret) {
        throw new BadRequestException('Missing webhook secret');
      }

      // Verify the webhook
      const wh = new Webhook(webhookSecret);
      let evt: any;

      try {
        evt = wh.verify(JSON.stringify(body), {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        });
      } catch (err) {
        console.log('Error verifying webhook:', err);
        throw new BadRequestException('Invalid webhook signature');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { type, data } = evt;

      switch (type) {
        case 'user.created':
          console.log('Attempting to handle user.created', type);
          await this.clerkWebHookService.handleUserCreated(data);
          console.log('Finished handling user.created');
          break;
        case 'user.updated':
          await this.clerkWebHookService.handleUserUpdated(data);
          break;
        case 'user.deleted':
          await this.clerkWebHookService.handleUserDeleted(data);
          break;
        default:
          console.log(`Unhandled webhook type: ${type}`);
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      if (err instanceof Error) {
        console.error('Webhook processing error:', {
          error: err.message,
          stack: err.stack,
          body: JSON.stringify(body, null, 2),
        });
      } else {
        console.error('Webhook processing error:', {
          error: errorMessage,
          body: JSON.stringify(body, null, 2),
        });
      }

      throw new BadRequestException(
        `Webhook processing failed: ${errorMessage}`,
      );
    }
  }
}
