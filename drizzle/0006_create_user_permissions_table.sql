CREATE TABLE IF NOT EXISTS "user_permissions" (
	"id" text PRIMARY KEY DEFAULT ('uperm_' || replace(gen_random_uuid()::text, '-', '')) NOT NULL,
	"user_id" text NOT NULL,
	"permission_code" text NOT NULL REFERENCES "permissions"("code") ON DELETE CASCADE,
	"scope_type" "role_scope" DEFAULT 'VILLAGE' NOT NULL,
	"scope_id" text,
	"is_granted" boolean DEFAULT true NOT NULL,
	"granted_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_permissions_user_id" ON "user_permissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_permissions_perm_code" ON "user_permissions" USING btree ("permission_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_permissions_scope" ON "user_permissions" USING btree ("scope_type", "scope_id");
