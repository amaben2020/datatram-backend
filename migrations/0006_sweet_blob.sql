ALTER TABLE "connections" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "connections" ADD COLUMN "updated_at" timestamp DEFAULT now();