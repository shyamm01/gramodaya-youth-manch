-- Migration: Rename social_works.member_id to user_id for consistency with
-- every other domain table's FK-to-profiles naming (complaints, audit_logs, etc.)
-- and to match the Drizzle schema definition in src/db/schema.ts.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'social_works' AND column_name = 'member_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'social_works' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.social_works RENAME COLUMN member_id TO user_id;
  END IF;
END $$;

DROP INDEX IF EXISTS idx_social_works_member_id;
CREATE INDEX IF NOT EXISTS idx_social_works_user_id ON public.social_works (user_id);
