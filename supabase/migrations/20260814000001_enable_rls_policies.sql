-- Migration: 20260814000001_enable_rls_policies.sql
-- Description: Enable Row Level Security (RLS) and define granular security policies

-- 1. Enable RLS on all tables
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_infos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any to prevent conflict
DROP POLICY IF EXISTS "Public can view active members" ON public.members;
DROP POLICY IF EXISTS "Public can view complaints" ON public.complaints;
DROP POLICY IF EXISTS "Public can insert complaints" ON public.complaints;
DROP POLICY IF EXISTS "Public can view approved social work" ON public.social_works;
DROP POLICY IF EXISTS "Public can view events" ON public.events;
DROP POLICY IF EXISTS "Public can view gallery" ON public.gallery;
DROP POLICY IF EXISTS "Public can view elders" ON public.elders;
DROP POLICY IF EXISTS "Public can view announcements" ON public.announcements;
DROP POLICY IF EXISTS "Public can view approved public info" ON public.public_infos;
DROP POLICY IF EXISTS "Anyone can view group messages" ON public.group_messages;
DROP POLICY IF EXISTS "Anyone can post to group messages" ON public.group_messages;
DROP POLICY IF EXISTS "Direct chat access" ON public.messages;
DROP POLICY IF EXISTS "Audit log view" ON public.audit_logs;

-- 3. Create security policies
CREATE POLICY "Public can view active members" ON public.members FOR SELECT USING (status = 'active' OR auth.role() = 'authenticated');
CREATE POLICY "Public can view complaints" ON public.complaints FOR SELECT USING (true);
CREATE POLICY "Public can insert complaints" ON public.complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view approved social work" ON public.social_works FOR SELECT USING (status IN ('approved', 'published') OR auth.role() = 'authenticated');
CREATE POLICY "Public can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public can view gallery" ON public.gallery FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');
CREATE POLICY "Public can view elders" ON public.elders FOR SELECT USING (true);
CREATE POLICY "Public can view announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Public can view approved public info" ON public.public_infos FOR SELECT USING (status = 'approved' OR auth.role() = 'authenticated');

CREATE POLICY "Anyone can view group messages" ON public.group_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can post to group messages" ON public.group_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Direct chat access" ON public.messages FOR ALL USING (true);
CREATE POLICY "Audit log view" ON public.audit_logs FOR SELECT USING (true);
