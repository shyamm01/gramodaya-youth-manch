-- Migration: Safely remove unused and redundant legacy tables
-- Drops the legacy 'members' table and unbinds foreign key constraints

DO $$ BEGIN
  -- Drop foreign keys referencing legacy members table
  ALTER TABLE IF EXISTS public.complaints DROP CONSTRAINT IF EXISTS complaints_member_id_fkey;
  ALTER TABLE IF EXISTS public.social_works DROP CONSTRAINT IF EXISTS social_works_member_id_fkey;
  ALTER TABLE IF EXISTS public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_member_id_fkey;
  ALTER TABLE IF EXISTS public.user_permissions DROP CONSTRAINT IF EXISTS user_permissions_member_id_members_id_fk;
  ALTER TABLE IF EXISTS public.user_village_roles DROP CONSTRAINT IF EXISTS user_village_roles_member_id_members_id_fk;

  -- Drop legacy members table
  DROP TABLE IF EXISTS public.members CASCADE;

  -- Drop legacy messages table if obsolete
  DROP TABLE IF EXISTS public.messages CASCADE;
  DROP TABLE IF EXISTS public.group_messages CASCADE;
EXCEPTION WHEN OTHERS THEN null;
END $$;
