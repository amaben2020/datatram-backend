ALTER TABLE "destinations" DROP CONSTRAINT "destinations_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "destinations" DROP COLUMN "user_id";