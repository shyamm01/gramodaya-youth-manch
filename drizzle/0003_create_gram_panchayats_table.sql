CREATE TABLE IF NOT EXISTS "gram_panchayats" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"district_id" bigint,
	"district_name" text DEFAULT 'Hardoi' NOT NULL,
	"district_name_hindi" text DEFAULT 'हरदोई',
	"state_id" bigint,
	"state_name" text DEFAULT 'Uttar Pradesh' NOT NULL,
	"state_name_hindi" text DEFAULT 'उत्तर प्रदेश',
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
CREATE INDEX IF NOT EXISTS "idx_gram_panchayats_name" ON "gram_panchayats" USING btree ("name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gram_panchayats_district" ON "gram_panchayats" USING btree ("district_name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gram_panchayats_pincode" ON "gram_panchayats" USING btree ("pincode");
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "gram_panchayats" ADD CONSTRAINT "gram_panchayats_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gram_panchayats" ADD CONSTRAINT "gram_panchayats_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint