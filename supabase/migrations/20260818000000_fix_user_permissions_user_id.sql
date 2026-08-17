-- Migration: public.user_permissions still had a leftover `member_id bigint`
-- column from the dropped legacy `members` table instead of `user_id uuid`
-- referencing public.profiles(id), causing "column user_id does not exist"
-- errors in /api/auth/me. Table is empty, so a straight rename + retype is safe.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_permissions' AND column_name = 'member_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_permissions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.user_permissions RENAME COLUMN member_id TO user_id;
    ALTER TABLE public.user_permissions ALTER COLUMN user_id TYPE uuid USING NULL;
  END IF;
END $$;

ALTER TABLE public.user_permissions
  DROP CONSTRAINT IF EXISTS user_permissions_member_id_fkey,
  DROP CONSTRAINT IF EXISTS user_permissions_user_id_fkey;

ALTER TABLE public.user_permissions
  ADD CONSTRAINT user_permissions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Clean up duplicate/stale indexes left over from the member_id era
DROP INDEX IF EXISTS idx_user_permissions_member_id;
DROP INDEX IF EXISTS idx_user_permissions_user;
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON public.user_permissions (user_id);

-- De-duplicate the two identical permission_code FKs left over from drift
ALTER TABLE public.user_permissions
  DROP CONSTRAINT IF EXISTS user_permissions_permission_code_fkey;
