CREATE TABLE IF NOT EXISTS "complaints" (
	"id" text PRIMARY KEY DEFAULT ('comp_' || replace(gen_random_uuid()::text, '-', '')) NOT NULL,
	"village_id" text REFERENCES "villages"("id") ON DELETE SET NULL,
	"user_id" uuid,
	"title" text NOT NULL,
	"category" "complaint_category" DEFAULT 'Other' NOT NULL,
	"description" text NOT NULL,
	"location" text DEFAULT 'Rasoolpur' NOT NULL,
	"reporter_name" text NOT NULL,
	"reporter_mobile" text NOT NULL,
	"status" "complaint_status" DEFAULT 'NEW' NOT NULL,
	"photo_url" text,
	"video_url" text,
	"is_demo" boolean DEFAULT false,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_complaints_village_id" ON "complaints" USING btree ("village_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_complaints_status" ON "complaints" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_complaints_category" ON "complaints" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_complaints_created_at" ON "complaints" USING btree ("created_at");
