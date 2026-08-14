CREATE TABLE IF NOT EXISTS "events" (
	"id" text PRIMARY KEY DEFAULT ('evt_' || replace(gen_random_uuid()::text, '-', '')) NOT NULL,
	"village_id" text REFERENCES "villages"("id") ON DELETE SET NULL,
	"title" text NOT NULL,
	"description" text,
	"date" text NOT NULL,
	"time" text DEFAULT '10:00 AM' NOT NULL,
	"location" text DEFAULT 'Rasoolpur Village' NOT NULL,
	"photo_url" text,
	"video_url" text,
	"status" "event_status" DEFAULT 'PUBLISHED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_village_id" ON "events" USING btree ("village_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_status" ON "events" USING btree ("status");
