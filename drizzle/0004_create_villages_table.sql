CREATE TABLE IF NOT EXISTS "villages" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"name_hindi" text NOT NULL,
	"gram_panchayat_id" bigint,
	"gram_panchayat_name" text DEFAULT 'Bahera',
	"gram_panchayat_name_hindi" text DEFAULT 'बहेरा',
	"district_id" bigint,
	"district_name" text DEFAULT 'Hardoi',
	"district_name_hindi" text DEFAULT 'हरदोई',
	"state_id" bigint,
	"state_name" text DEFAULT 'Uttar Pradesh',
	"state_name_hindi" text DEFAULT 'उत्तर प्रदेश',
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
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "gram_panchayat_name" text DEFAULT 'Bahera';
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "gram_panchayat_name_hindi" text DEFAULT 'बहेरा';
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "district_name" text DEFAULT 'Hardoi';
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "district_name_hindi" text DEFAULT 'हरदोई';
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "state_name" text DEFAULT 'Uttar Pradesh';
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "state_name_hindi" text DEFAULT 'उत्तर प्रदेश';
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "block_name" text DEFAULT 'Hardoi';
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "block_name_hindi" text DEFAULT 'हरदोई';
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "pincode" text DEFAULT '241125';
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "post_office" text DEFAULT 'Bahera Rasoolpur';
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_villages_slug" ON "villages" USING btree ("slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_villages_panchayat_id" ON "villages" USING btree ("gram_panchayat_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_villages_district_name" ON "villages" USING btree ("district_name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_villages_pincode" ON "villages" USING btree ("pincode");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_villages_is_active" ON "villages" USING btree ("is_active");
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "villages" ADD CONSTRAINT "villages_gram_panchayat_id_gram_panchayats_id_fk" FOREIGN KEY ("gram_panchayat_id") REFERENCES "public"."gram_panchayats"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "villages" ADD CONSTRAINT "villages_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "villages" ADD CONSTRAINT "villages_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint