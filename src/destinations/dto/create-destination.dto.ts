// src/destinations/dto/create-destination.dto.ts
export class CreateDestinationDto {
  name: string;
  projectId: string;
  metadata?: Record<string, any>;
}

// src/destinations/dto/update-destination.dto.ts
export class UpdateDestinationDto extends CreateDestinationDto {
  // You can add specific update fields if needed
}
