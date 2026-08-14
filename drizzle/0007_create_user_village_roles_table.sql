CREATE TABLE IF NOT EXISTS "user_village_roles" (
	"id" text PRIMARY KEY DEFAULT ('uvr_' || replace(gen_random_uuid()::text, '-', '')) NOT NULL,
	"user_id" text NOT NULL,
	"village_id" text NOT NULL REFERENCES "villages"("id") ON DELETE CASCADE,
	"role" "system_role" DEFAULT 'MEMBER' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_village_roles_user" ON "user_village_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_village_roles_village" ON "user_village_roles" USING btree ("village_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_village_roles_role" ON "user_village_roles" USING btree ("role");
