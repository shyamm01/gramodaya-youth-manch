-- ============================================================================
-- 0006 · profiles (सदस्य / उपयोगकर्ता)
-- ----------------------------------------------------------------------------
-- The single user model. The old `members` table was a second, parallel copy of
-- the same person keyed by bigint, and every domain table pointed at one or the
-- other depending on when it was written. `profiles` — keyed by the Supabase
-- auth.users UUID — is now the only identity relation; 0028 removes the last
-- traces of `members`.
--
-- Columns deliberately NOT present (all removed in 0028, see notes there):
--   role           — transitive on system_role
--   is_approved    — transitive on status ('active')
--   pincode        — transitive on village_id -> villages.pincode
--   address, village_name, gram_panchayat, district, state
--                  — transitive on village_id, resolved through the hierarchy
--   photo_url      — duplicate of avatar_url
-- ============================================================================

CREATE TABLE IF NOT EXISTS "profiles" (
  "id"                    uuid PRIMARY KEY NOT NULL,
  "full_name"             text NOT NULL,
  "avatar_url"            text,
  "mobile"                text,
  "email"                 text,
  "father_name"           text,
  "dob"                   text,
  "gender"                text,
  "village_id"            bigint,
  "house_no"              text,
  "street"                text,
  "occupation"            text,
  "designation"           text,
  "political_background"  text,
  "blood_group"           text,
  "status"                "member_status" DEFAULT 'pending' NOT NULL,
  "system_role"           "system_role" DEFAULT 'MEMBER' NOT NULL,
  "created_at"            timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"            timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Reconcile ------------------------------------------------------------------
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "avatar_url" text;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "mobile" text;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "email" text;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "father_name" text;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "dob" text;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "gender" text;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "village_id" bigint;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "house_no" text;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "street" text;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "occupation" text;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "designation" text;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "political_background" text;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "blood_group" text;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "status" "member_status" DEFAULT 'pending';
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "system_role" "system_role" DEFAULT 'MEMBER';
--> statement-breakpoint

-- An earlier history added these as text and only later cast them; a database
-- that stalled midway still has text columns here.
SELECT gym_cast_column_to_enum('profiles', 'status', 'member_status', 'pending');
--> statement-breakpoint
SELECT gym_cast_column_to_enum('profiles', 'system_role', 'system_role', 'MEMBER');
--> statement-breakpoint

-- Empty strings were being written where "unknown" was meant, which defeats the
-- partial unique index below and makes every `IS NULL` check in the API wrong.
UPDATE "profiles" SET "mobile" = NULL WHERE btrim(COALESCE("mobile", '')) = '';
--> statement-breakpoint
UPDATE "profiles" SET "email" = NULL WHERE btrim(COALESCE("email", '')) = '';
--> statement-breakpoint
UPDATE "profiles" SET "avatar_url" = NULL WHERE btrim(COALESCE("avatar_url", '')) = '';
--> statement-breakpoint

UPDATE "profiles" SET "full_name" = 'सदस्य' WHERE btrim(COALESCE("full_name", '')) = '';
--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "full_name" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "status" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "system_role" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint

-- Foreign keys ---------------------------------------------------------------
-- profiles.id mirrors auth.users.id. Guarded because a plain PostgreSQL target
-- (local dev without the Supabase auth schema) has no auth.users to point at.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_auth_users_id_fk;
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_id_auth_users_id_fk
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;
--> statement-breakpoint

-- SET NULL: a member record survives their village chapter being removed.
SELECT gym_drop_foreign_keys('profiles', 'village_id');
--> statement-breakpoint
UPDATE "profiles" p SET "village_id" = NULL
 WHERE "village_id" IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM "villages" v WHERE v."id" = p."village_id");
--> statement-breakpoint
ALTER TABLE "profiles"
  ADD CONSTRAINT "profiles_village_id_villages_id_fk"
  FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
-- Mobile is the login key for the OTP flow, so it has to be unique. Partial,
-- because "no mobile on file" is a legitimate state for an email-only account.
DROP INDEX IF EXISTS "idx_profiles_mobile_unique";
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_profiles_mobile_unique"
  ON "profiles" USING btree ("mobile") WHERE "mobile" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profiles_mobile" ON "profiles" USING btree ("mobile");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profiles_email" ON "profiles" USING btree ("email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profiles_status" ON "profiles" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profiles_system_role" ON "profiles" USING btree ("system_role");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profiles_village_id" ON "profiles" USING btree ("village_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profiles_created_at" ON "profiles" USING btree ("created_at");
--> statement-breakpoint

SELECT gym_attach_updated_at('profiles');
