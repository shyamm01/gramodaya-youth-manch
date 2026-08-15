CREATE TABLE IF NOT EXISTS "villages" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"name_hindi" text NOT NULL,
	"gram_panchayat_id" bigint NOT NULL,
	"block_name" text DEFAULT 'Hardoi',
	"block_name_hindi" text DEFAULT 'हरदोई',
	"pincode" text DEFAULT '241125',
	"post_office" text DEFAULT 'Bahera Rasoolpur',
	"org_name" text DEFAULT 'Gramodaya Youth Manch' NOT NULL,
	"org_name_hindi" text DEFAULT 'ग्रामोदय यूथ मंच' NOT NULL,
	"slogan_hindi" text DEFAULT 'युवा शक्ति • ग्राम विकास • उज्ज्वल भविष्य',
	"tagline_hindi" text DEFAULT 'युवा शक्ति से ग्रामोदय की ओर',
	"org_purpose_hindi" text,
	"contact_mobile" text,
	"contact_email" text,
	"banner_photo_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "villages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "villages" DROP COLUMN IF EXISTS "gram_panchayat_name";
ALTER TABLE "villages" DROP COLUMN IF EXISTS "gram_panchayat_name_hindi";
ALTER TABLE "villages" DROP COLUMN IF EXISTS "district_id";
ALTER TABLE "villages" DROP COLUMN IF EXISTS "district_name";
ALTER TABLE "villages" DROP COLUMN IF EXISTS "district_name_hindi";
ALTER TABLE "villages" DROP COLUMN IF EXISTS "state_id";
ALTER TABLE "villages" DROP COLUMN IF EXISTS "state_name";
ALTER TABLE "villages" DROP COLUMN IF EXISTS "state_name_hindi";
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_villages_slug" ON "villages" USING btree ("slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_villages_name" ON "villages" USING btree ("name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_villages_panchayat_id" ON "villages" USING btree ("gram_panchayat_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_villages_pincode" ON "villages" USING btree ("pincode");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_villages_is_active" ON "villages" USING btree ("is_active");
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "villages" ADD CONSTRAINT "villages_gram_panchayat_id_gram_panchayats_id_fk" FOREIGN KEY ("gram_panchayat_id") REFERENCES "public"."gram_panchayats"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint