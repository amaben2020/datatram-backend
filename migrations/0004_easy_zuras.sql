CREATE TYPE "public"."destination_type" AS ENUM('bigquery', 'snowflake', 's3');--> statement-breakpoint
CREATE TABLE "connection_histories" (
	"id" serial PRIMARY KEY NOT NULL,
	"destination_id" integer,
	"attempted_at" timestamp DEFAULT now(),
	"status" varchar(50),
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
ALTER TABLE "destinations" ADD COLUMN "type" "destination_type" DEFAULT 'bigquery';--> statement-breakpoint
ALTER TABLE "destinations" ADD COLUMN "service_key_json" jsonb;--> statement-breakpoint
ALTER TABLE "destinations" ADD COLUMN "dataset_id" varchar(255);--> statement-breakpoint
ALTER TABLE "destinations" ADD COLUMN "target_table_name" varchar(255);--> statement-breakpoint
ALTER TABLE "connection_histories" ADD CONSTRAINT "connection_histories_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE no action ON UPDATE no action;