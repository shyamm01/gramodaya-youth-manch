-- Drizzle Migration: 0019_add_gram_panchayats_and_address_fields.sql
-- Add Gram Panchayats master columns and structured address attributes to members & villages

ALTER TABLE "gram_panchayats" ADD COLUMN IF NOT EXISTS "district_name" text NOT NULL DEFAULT 'Jaunpur';
ALTER TABLE "gram_panchayats" ADD COLUMN IF NOT EXISTS "district_name_hindi" text DEFAULT 'जौनपुर';
ALTER TABLE "gram_panchayats" ADD COLUMN IF NOT EXISTS "state_id" bigint;
ALTER TABLE "gram_panchayats" ADD COLUMN IF NOT EXISTS "state_name" text NOT NULL DEFAULT 'Uttar Pradesh';
ALTER TABLE "gram_panchayats" ADD COLUMN IF NOT EXISTS "state_name_hindi" text DEFAULT 'उत्तर प्रदेश';
ALTER TABLE "gram_panchayats" ADD COLUMN IF NOT EXISTS "block_name" text DEFAULT 'Shahganj';
ALTER TABLE "gram_panchayats" ADD COLUMN IF NOT EXISTS "block_name_hindi" text DEFAULT 'शाहगंज';
ALTER TABLE "gram_panchayats" ADD COLUMN IF NOT EXISTS "pincode" text DEFAULT '222139';
ALTER TABLE "gram_panchayats" ADD COLUMN IF NOT EXISTS "post_office" text DEFAULT 'Rasulpur';
ALTER TABLE "gram_panchayats" ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true;
ALTER TABLE "gram_panchayats" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;

ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "gram_panchayat_name" text DEFAULT 'Bahera';
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "gram_panchayat_name_hindi" text DEFAULT 'बहेरा';
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "district_name" text DEFAULT 'Jaunpur';
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "district_name_hindi" text DEFAULT 'जौनपुर';
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "state_name" text DEFAULT 'Uttar Pradesh';
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "state_name_hindi" text DEFAULT 'उत्तर प्रदेश';
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "block_name" text DEFAULT 'Shahganj';
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "block_name_hindi" text DEFAULT 'शाहगंज';
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "pincode" text DEFAULT '222139';
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "post_office" text DEFAULT 'Rasulpur';

ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "pincode" text DEFAULT '222139';
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "state" text DEFAULT 'Uttar Pradesh';
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "district" text DEFAULT 'Jaunpur';
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "block" text DEFAULT 'Shahganj';
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "gram_panchayat" text DEFAULT 'Bahera';
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "village_name" text DEFAULT 'Rasoolpur';
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "post_office" text DEFAULT 'Rasulpur';
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "house_no" text;
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "street" text;

CREATE INDEX IF NOT EXISTS "idx_members_pincode" ON "members" ("pincode");
CREATE INDEX IF NOT EXISTS "idx_members_gram_panchayat" ON "members" ("gram_panchayat");
CREATE INDEX IF NOT EXISTS "idx_villages_pincode" ON "villages" ("pincode");
