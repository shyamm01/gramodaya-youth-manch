CREATE TABLE IF NOT EXISTS "members" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"village_id" bigint,
	"supabase_user_id" uuid,
	"name" text NOT NULL,
	"mobile" text NOT NULL,
	"email" text,
	"password_hash" text,
	"status" "member_status" DEFAULT 'active' NOT NULL,
	"photo_url" text,
	"organization_name" text DEFAULT 'ग्रामोदय यूथ मंच',
	"father_name" text,
	"dob" text,
	"gender" text,
	"address" text DEFAULT 'ग्राम रसूलपुर, ग्राम पंचायत बहेरा',
	"pincode" text DEFAULT '241125',
	"state" text DEFAULT 'Uttar Pradesh',
	"district" text DEFAULT 'Hardoi',
	"block" text DEFAULT 'Hardoi',
	"gram_panchayat" text DEFAULT 'Bahera',
	"village_name" text DEFAULT 'Rasoolpur',
	"post_office" text DEFAULT 'Bahera Rasoolpur',
	"house_no" text,
	"street" text,
	"occupation" text,
	"designation" text,
	"political_background" text,
	"blood_group" text,
	"role" "member_role" DEFAULT 'MEMBER' NOT NULL,
	"system_role" "system_role" DEFAULT 'MEMBER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "members_mobile_unique" UNIQUE("mobile")
);
--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "pincode" text DEFAULT '241125';
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "state" text DEFAULT 'Uttar Pradesh';
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "district" text DEFAULT 'Hardoi';
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "block" text DEFAULT 'Hardoi';
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "gram_panchayat" text DEFAULT 'Bahera';
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "village_name" text DEFAULT 'Rasoolpur';
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "post_office" text DEFAULT 'Bahera Rasoolpur';
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "house_no" text;
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "street" text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_village_id" ON "members" USING btree ("village_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_mobile" ON "members" USING btree ("mobile");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_status" ON "members" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_pincode" ON "members" USING btree ("pincode");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_gram_panchayat" ON "members" USING btree ("gram_panchayat");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_system_role" ON "members" USING btree ("system_role");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_created_at" ON "members" USING btree ("created_at");
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "members" ADD CONSTRAINT "members_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint