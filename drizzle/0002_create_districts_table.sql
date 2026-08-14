CREATE TABLE IF NOT EXISTS "districts" (
	"id" text PRIMARY KEY NOT NULL,
	"state_id" text NOT NULL REFERENCES "states"("id") ON DELETE CASCADE,
	"name" text NOT NULL,
	"name_hindi" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_districts_state_id" ON "districts" USING btree ("state_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_districts_name" ON "districts" USING btree ("name");
