CREATE TABLE IF NOT EXISTS "gram_panchayats" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"district_id" bigint NOT NULL,
	"name" text NOT NULL,
	"name_hindi" text,
	"block_name" text DEFAULT 'Hardoi',
	"block_name_hindi" text DEFAULT 'हरदोई',
	"pincode" text DEFAULT '241125',
	"post_office" text DEFAULT 'Bahera Rasoolpur',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gram_panchayats" DROP COLUMN IF EXISTS "district_name";
ALTER TABLE "gram_panchayats" DROP COLUMN IF EXISTS "district_name_hindi";
ALTER TABLE "gram_panchayats" DROP COLUMN IF EXISTS "state_id";
ALTER TABLE "gram_panchayats" DROP COLUMN IF EXISTS "state_name";
ALTER TABLE "gram_panchayats" DROP COLUMN IF EXISTS "state_name_hindi";
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gram_panchayats_district_id" ON "gram_panchayats" USING btree ("district_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gram_panchayats_name" ON "gram_panchayats" USING btree ("name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gram_panchayats_pincode" ON "gram_panchayats" USING btree ("pincode");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gram_panchayats_is_active" ON "gram_panchayats" USING btree ("is_active");
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "gram_panchayats" ADD CONSTRAINT "gram_panchayats_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint