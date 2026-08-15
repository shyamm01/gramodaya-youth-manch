CREATE TABLE IF NOT EXISTS "user_village_roles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"village_id" bigint NOT NULL,
	"role" "system_role" DEFAULT 'MEMBER' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"assigned_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_village_roles_user" ON "user_village_roles" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_village_roles_village" ON "user_village_roles" USING btree ("village_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_village_roles_role" ON "user_village_roles" USING btree ("role");
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "user_village_roles" ADD CONSTRAINT "user_village_roles_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint