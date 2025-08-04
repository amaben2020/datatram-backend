import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
// import { ClerkUserCreatedEvent } from './types';

@Injectable()
export class ClerkWebhookService {
  constructor(private readonly usersService: UsersService) {}
  async handleUserCreated(userData: any) {
    try {
      console.log('Creating user ===>:', userData);

      await this.usersService.createFromClerk({
        clerkId: userData.id,
        email: Array.isArray(userData.email_addresses)
          ? userData.email_addresses[0]?.email_address
          : '',
        firstName: userData.first_name,
        lastName: userData.last_name,
        imageUrl: userData.image_url,
        username: userData.username,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      // Don't throw here - we don't want to break the webhook
      throw error;
    }
  }

  async handleUserUpdated(userData: any) {
    try {
      console.log('Updating user:', userData);

      await this.usersService.updateFromClerk(userData.id, {
        email: userData.email_addresses[0]?.email_address,
        firstName: userData.first_name,
        lastName: userData.last_name,
        imageUrl: userData.image_url,
        username: userData.username,
      });
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }

  async handleUserDeleted(userData: { id: string }) {
    try {
      console.log('Deleting user:', userData);
      await this.usersService.deleteByClerkId(userData.id);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }
}
