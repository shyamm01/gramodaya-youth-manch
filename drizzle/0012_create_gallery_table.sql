CREATE TABLE IF NOT EXISTS "gallery" (
	"id" text PRIMARY KEY DEFAULT ('gal_' || replace(gen_random_uuid()::text, '-', '')) NOT NULL,
	"village_id" text REFERENCES "villages"("id") ON DELETE SET NULL,
	"caption" text,
	"photo_url" text NOT NULL,
	"uploaded_by" text DEFAULT 'Admin' NOT NULL,
	"date" date DEFAULT CURRENT_DATE NOT NULL,
	"status" "gallery_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gallery_village_id" ON "gallery" USING btree ("village_id");
