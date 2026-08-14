CREATE TABLE IF NOT EXISTS "public_infos" (
	"id" text PRIMARY KEY DEFAULT ('info_' || replace(gen_random_uuid()::text, '-', '')) NOT NULL,
	"village_id" text REFERENCES "villages"("id") ON DELETE SET NULL,
	"name" text NOT NULL,
	"mobile" text NOT NULL,
	"information" text NOT NULL,
	"photo_url" text,
	"status" "public_info_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_public_infos_village_id" ON "public_infos" USING btree ("village_id");
