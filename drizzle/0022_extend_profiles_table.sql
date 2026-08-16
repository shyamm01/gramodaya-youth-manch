-- Migration 0022: Extend profiles table with membership columns
DO $$ BEGIN
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "photo_url" text;
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "mobile" text;
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "email" text;
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "father_name" text;
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "dob" text;
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "gender" text;
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "village_id" bigint;
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "village_name" text;
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "gram_panchayat" text;
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "district" text;
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "state" text;
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "pincode" text DEFAULT '241125';
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "address" text;
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "house_no" text;
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "street" text;
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "occupation" text;
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "designation" text;
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "political_background" text;
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "blood_group" text;
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "status" "member_status" NOT NULL DEFAULT 'pending';
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "role" "member_role" NOT NULL DEFAULT 'MEMBER';
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "system_role" "system_role" NOT NULL DEFAULT 'MEMBER';
  ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "is_approved" boolean NOT NULL DEFAULT false;
EXCEPTION WHEN OTHERS THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "idx_profiles_mobile" ON "profiles" ("mobile");
CREATE INDEX IF NOT EXISTS "idx_profiles_status" ON "profiles" ("status");
CREATE INDEX IF NOT EXISTS "idx_profiles_system_role" ON "profiles" ("system_role");
CREATE INDEX IF NOT EXISTS "idx_profiles_village_id" ON "profiles" ("village_id");
