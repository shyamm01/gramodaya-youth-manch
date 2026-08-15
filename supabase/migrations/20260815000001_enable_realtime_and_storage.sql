-- Supabase Platform Extension: Storage Buckets & Realtime Publications

-- 1. Setup Supabase Realtime Publication for Live Chat and Activity
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Setup Storage Buckets for Media Uploads
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('member-photos', 'member-photos', true),
  ('complaints-media', 'complaints-media', true),
  ('social-work-media', 'social-work-media', true),
  ('gallery-photos', 'gallery-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to storage objects in public buckets
DO $$ BEGIN
  CREATE POLICY "Public storage object access" 
  ON storage.objects FOR SELECT 
  USING (bucket_id IN ('member-photos', 'complaints-media', 'social-work-media', 'gallery-photos'));
EXCEPTION WHEN duplicate_object THEN null; END $$;
