import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { Webhook } from 'svix';
import { ClerkWebhookService } from './clerk-webhook.service';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly clerkWebHookService: ClerkWebhookService) {}

  @Post('clerk')
  async handleClerkWebhook(
    @Body() body: any,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ) {
    // Get your webhook secret from Clerk Dashboard
    // const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    const webhookSecret = 'whsec_fEOn0Z0MVm3XhJ+9umHJwe4vRN+BRJV8';

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

    // Handle different event types
    const { type, data } = evt;

    console.log('DATA FROM CLERK WEBHOOK', data);
    console.log(type);

    switch (type) {
      case 'user.created':
        await this.clerkWebHookService.handleUserCreated(data);
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
  }
}
