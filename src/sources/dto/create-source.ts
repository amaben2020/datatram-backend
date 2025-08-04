// src/sources/dto/create-source.dto.ts
export class CreateSourceDto {
  name: string;
  host?: string;
  type: 'pdf' | 'csv' | 'excel' | 'feather' | 'json' | 'parquet' | 'xml';
  metadata?: Record<string, any>;
  // image?: string;
}

// src/sources/dto/update-source.dto.ts
export class UpdateSourceDto extends CreateSourceDto {
  // You can add specific update fields if needed
}
