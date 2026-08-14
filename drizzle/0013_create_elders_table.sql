CREATE TABLE IF NOT EXISTS "elders" (
	"id" text PRIMARY KEY DEFAULT ('eld_' || replace(gen_random_uuid()::text, '-', '')) NOT NULL,
	"village_id" text REFERENCES "villages"("id") ON DELETE SET NULL,
	"name" text NOT NULL,
	"mobile" text,
	"location" text DEFAULT 'Rasoolpur',
	"details" text,
	"photo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_elders_village_id" ON "elders" USING btree ("village_id");
