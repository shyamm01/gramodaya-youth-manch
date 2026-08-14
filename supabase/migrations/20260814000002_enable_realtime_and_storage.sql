-- Migration: 20260814000002_enable_realtime_and_storage.sql
-- Description: Configure Realtime publication and Storage buckets for media uploads

-- 1. Enable Realtime Replication on dynamic tables
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE
    public.group_messages,
    public.messages,
    public.complaints,
    public.announcements,
    public.members;
COMMIT;

-- 2. Setup Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('member-photos', 'member-photos', true),
  ('complaint-media', 'complaint-media', true),
  ('gallery-photos', 'gallery-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Security Policies
DROP POLICY IF EXISTS "Public Access Member Photos" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Member Photos" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Complaint Media" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Complaint Media" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Gallery Photos" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Gallery Photos" ON storage.objects;

CREATE POLICY "Public Access Member Photos" ON storage.objects FOR SELECT USING (bucket_id = 'member-photos');
CREATE POLICY "Public Upload Member Photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'member-photos');

CREATE POLICY "Public Access Complaint Media" ON storage.objects FOR SELECT USING (bucket_id = 'complaint-media');
CREATE POLICY "Public Upload Complaint Media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'complaint-media');

CREATE POLICY "Public Access Gallery Photos" ON storage.objects FOR SELECT USING (bucket_id = 'gallery-photos');
CREATE POLICY "Public Upload Gallery Photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery-photos');
