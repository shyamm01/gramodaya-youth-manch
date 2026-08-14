CREATE TABLE IF NOT EXISTS "social_works" (
	"id" text PRIMARY KEY DEFAULT ('sw_' || replace(gen_random_uuid()::text, '-', '')) NOT NULL,
	"village_id" text REFERENCES "villages"("id") ON DELETE SET NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"date" date DEFAULT CURRENT_DATE NOT NULL,
	"location" text DEFAULT 'Rasoolpur' NOT NULL,
	"submitter_name" text NOT NULL,
	"submitter_mobile" text NOT NULL,
	"photo_url" text,
	"video_url" text,
	"status" "social_work_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_social_works_village_id" ON "social_works" USING btree ("village_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_social_works_status" ON "social_works" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_social_works_date" ON "social_works" USING btree ("date");
