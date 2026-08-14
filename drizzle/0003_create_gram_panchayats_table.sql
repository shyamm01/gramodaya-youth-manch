CREATE TABLE IF NOT EXISTS "gram_panchayats" (
	"id" text PRIMARY KEY NOT NULL,
	"district_id" text NOT NULL REFERENCES "districts"("id") ON DELETE CASCADE,
	"name" text NOT NULL,
	"name_hindi" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gram_panchayats_district_id" ON "gram_panchayats" USING btree ("district_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gram_panchayats_name" ON "gram_panchayats" USING btree ("name");
