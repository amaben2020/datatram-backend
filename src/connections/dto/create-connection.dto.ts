// src/connections/dto/create-connection.dto.ts
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateConnectionDto {
  @IsNotEmpty()
  @IsNumber()
  sourceId: number;

  @IsNotEmpty()
  @IsNumber()
  destinationId: number;
}

export class UpdateConnectionDto {
  @IsOptional()
  @IsNumber()
  sourceId?: number;

  @IsOptional()
  @IsNumber()
  destinationId?: number;
}
