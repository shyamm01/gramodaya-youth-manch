CREATE TABLE IF NOT EXISTS "villages" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"name_hindi" text NOT NULL,
	"gram_panchayat_id" text REFERENCES "gram_panchayats"("id") ON DELETE SET NULL,
	"district_id" text REFERENCES "districts"("id") ON DELETE SET NULL,
	"state_id" text REFERENCES "states"("id") ON DELETE SET NULL,
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
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_villages_slug" ON "villages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_villages_panchayat_id" ON "villages" USING btree ("gram_panchayat_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_villages_district_id" ON "villages" USING btree ("district_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_villages_is_active" ON "villages" USING btree ("is_active");
