-- Supabase Platform Extension: Row Level Security (RLS)
-- Enables public read and authenticated management across all Drizzle tables

ALTER TABLE IF EXISTS public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gram_panchayats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.social_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.elders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.public_infos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_village_roles ENABLE ROW LEVEL SECURITY;

-- Allow public reads on community and location master tables
DO $$ BEGIN
  CREATE POLICY "Public read states" ON public.states FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read districts" ON public.districts FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read gram_panchayats" ON public.gram_panchayats FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read villages" ON public.villages FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read members" ON public.members FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read complaints" ON public.complaints FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read social_works" ON public.social_works FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read gallery" ON public.gallery FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read elders" ON public.elders FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read public_infos" ON public.public_infos FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read group_messages" ON public.group_messages FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
