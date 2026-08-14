CREATE TABLE IF NOT EXISTS "announcements" (
	"id" text PRIMARY KEY DEFAULT ('ann_' || replace(gen_random_uuid()::text, '-', '')) NOT NULL,
	"village_id" text REFERENCES "villages"("id") ON DELETE SET NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"published_by" text DEFAULT 'ग्रामोदय यूथ मंच' NOT NULL,
	"date" date DEFAULT CURRENT_DATE NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_announcements_village_id" ON "announcements" USING btree ("village_id");
