export interface StorageConfig {
  destination: string;
  maxFileSize?: number;
  allowedMimeTypes?: string[];
}

export const storageConfig: StorageConfig = {
  destination: './uploads',
  maxFileSize: 1024 * 1024 * 10, // 10MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/json',
    'application/xml',
    'application/octet-stream', // For feather/parquet
  ],
};
