-- ============================================================================
-- 0028 · DROP LEGACY OBJECTS
-- ----------------------------------------------------------------------------
-- Removes everything the normalised schema has superseded. This runs after all
-- table files so nothing is dropped while something still depends on it.
--
-- Each drop is guarded, so the file is a no-op on a database created fresh from
-- 0000..0027 and only does work on one carrying the old shape.
-- ============================================================================

-- 1. Duplicate identity tables ------------------------------------------------
-- `members` was a second copy of a person keyed by bigint alongside `profiles`;
-- `group_messages` and `messages` were two earlier chat tables superseded by
-- chat_rooms / chat_members / chat_messages.
DROP TABLE IF EXISTS "members" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "group_messages" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "messages" CASCADE;
--> statement-breakpoint

-- 2. The `permissions` code table ---------------------------------------------
-- One row per 'module:verb' string, with the module name repeated as free text.
-- Superseded by modules + the can_read/can_write/can_update/can_delete columns
-- on user_permissions (0007, 0008), which say the same thing without making the
-- verb part of the key. 0008 has already mapped any surviving grants across.
DROP TABLE IF EXISTS "permissions" CASCADE;
--> statement-breakpoint

-- 3. Transitively dependent columns on profiles -------------------------------
-- Each of these was derivable from a column that stays, and each had already
-- drifted out of agreement with its source on live data:
--   role         -> system_role         (ADMIN vs SUPER_ADMIN disagreed)
--   is_approved  -> status = 'active'
--   pincode      -> villages.pincode via village_id (the members API already
--                   reads the village's pincode and ignores this column)
--   address, village_name, gram_panchayat, district, state
--                -> resolved through village_id and the geography hierarchy
--   photo_url    -> avatar_url
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "role";
--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "is_approved";
--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "pincode";
--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "address";
--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "village_name";
--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "gram_panchayat";
--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "district";
--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "state";
--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "photo_url";
--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "supabase_user_id";
--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "password_hash";
--> statement-breakpoint

-- 4. Enum types with no remaining columns -------------------------------------
-- member_role backed profiles.role; complaint_category backed complaints.category.
DROP TYPE IF EXISTS "member_role";
--> statement-breakpoint
DROP TYPE IF EXISTS "complaint_category";
--> statement-breakpoint

-- 5. Superseded trigger functions ---------------------------------------------
-- update_updated_at_column() was attached to complaints only; every table now
-- uses the shared gym_set_updated_at() via gym_attach_updated_at().
DROP FUNCTION IF EXISTS "update_updated_at_column"() CASCADE;
--> statement-breakpoint
-- handle_new_auth_user() inserted into the dropped `members` table, so every
-- new signup failed with "Database error saving new user". Profile creation is
-- handled by handle_new_auth_user_profile() (0031).
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  END IF;
END $$;
--> statement-breakpoint
DROP FUNCTION IF EXISTS "handle_new_auth_user"() CASCADE;
