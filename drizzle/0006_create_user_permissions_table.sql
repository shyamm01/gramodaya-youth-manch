CREATE TABLE IF NOT EXISTS "user_permissions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"permission_code" text NOT NULL,
	"scope_type" "role_scope" DEFAULT 'VILLAGE' NOT NULL,
	"scope_id" bigint,
	"is_granted" boolean DEFAULT true NOT NULL,
	"granted_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_permissions_user" ON "user_permissions" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_permissions_code" ON "user_permissions" USING btree ("permission_code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_permissions_scope" ON "user_permissions" USING btree ("scope_type","scope_id");
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_code_permissions_code_fk" FOREIGN KEY ("permission_code") REFERENCES "public"."permissions"("code") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint