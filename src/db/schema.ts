import {
  integer,
  jsonb,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { pgEnum } from 'drizzle-orm/pg-core';

export const sourceTypeEnum = pgEnum('source_type', [
  'pdf',
  'csv',
  'excel',
  'feather',
  'json',
  'parquet',
  'xml',
]);

export const destinationTypeEnum = pgEnum('destination_type', [
  'bigquery',
  'snowflake',
  's3',
]); // Start with 'bigquery'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  username: varchar('username', { length: 255 }),
  imageUrl: varchar('image_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const sources = pgTable('sources', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  host: varchar('host', { length: 255 }),
  image: varchar('image', { length: 255 }),
  type: sourceTypeEnum('type'),
  file: varchar('file', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  metadata: jsonb('metadata').default({}),
  userId: integer('user_id').references(() => users.id),
});

// export const destinations = pgTable('destinations', {
//   id: serial('id').primaryKey(),
//   name: varchar('name', { length: 255 }),
//   projectId: varchar('project_id', { length: 255 }),
//   image: varchar('image', { length: 255 }),
//   createdAt: timestamp('created_at').defaultNow(),
//   updatedAt: timestamp('updated_at').defaultNow(),
//   metadata: jsonb('metadata').default({}),
//   userId: integer('user_id').references(() => users.id),
//   url: varchar('url', { length: 1000 }).default(''),
// });
export const destinations = pgTable('destinations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  type: destinationTypeEnum('type').default('bigquery'),
  projectId: varchar('project_id', { length: 255 }),
  image: varchar('image', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  // userId: integer('user_id').references(() => users.id),
  url: varchar('url', { length: 1000 }).default(''),
  serviceKeyJson: jsonb('service_key_json'),
  datasetId: varchar('dataset_id', { length: 255 }),
  targetTableName: varchar('target_table_name', { length: 255 }),
  metadata: jsonb('metadata').default({}),
});

export const connectionHistories = pgTable('connection_histories', {
  id: serial('id').primaryKey(),
  // Link to the connection that was used for this history
  connectionId: integer('connection_id').references(() => connections.id),
  // Keep these for easier querying without joins
  sourceId: integer('source_id').references(() => sources.id),
  destinationId: integer('destination_id').references(() => destinations.id),
  // Timestamp of the attempt
  attemptedAt: timestamp('attempted_at').defaultNow(),
  // The status of the connection (e.g., 'success', 'failure', 'pending')
  status: varchar('status', { length: 50 }),
  // Optional: Store any additional details like the number of rows processed, error stack traces, etc.
  metadata: jsonb('metadata').default({}),
});

export const connections = pgTable('connections', {
  id: serial('id').primaryKey(),
  sourceId: integer('source_id').references(() => sources.id),
  destinationId: integer('destination_id').references(() => destinations.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const schema = {
  users,
  sources,
  destinations,
  connections,
};
