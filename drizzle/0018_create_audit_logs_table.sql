CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" text PRIMARY KEY DEFAULT ('log_' || replace(gen_random_uuid()::text, '-', '')) NOT NULL,
	"village_id" text REFERENCES "villages"("id") ON DELETE SET NULL,
	"action" text NOT NULL,
	"admin_name" text DEFAULT 'Admin' NOT NULL,
	"admin_mobile" text DEFAULT '',
	"record_affected" text DEFAULT '',
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_village_id" ON "audit_logs" USING btree ("village_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_timestamp" ON "audit_logs" USING btree ("timestamp");
