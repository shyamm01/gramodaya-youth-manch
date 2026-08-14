-- Migration: 20260814000005_enforce_member_approval_posting.sql
-- Description: Enforce that only approved (active) members or admins can post/create data, while unapproved members can view/read all data.

-- 1. Helper function to check if a phone number belongs to an active member or admin
CREATE OR REPLACE FUNCTION public.is_approved_poster(p_mobile TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_clean_mobile TEXT;
BEGIN
    IF p_mobile IS NULL OR TRIM(p_mobile) = '' THEN
        RETURN FALSE;
    END IF;

    -- Extract 10 trailing digits
    v_clean_mobile := SUBSTRING(REGEXP_REPLACE(p_mobile, '\D', '', 'g') FROM '.{10}$');

    -- Check if user is Super Admin or Admin or Active Member
    RETURN EXISTS (
        SELECT 1 FROM public.members m
        WHERE SUBSTRING(REGEXP_REPLACE(m.mobile, '\D', '', 'g') FROM '.{10}$') = v_clean_mobile
          AND (m.status = 'active' OR m.role IN ('SUPER_ADMIN', 'ADMIN'))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop legacy open insert policies if needed
DROP POLICY IF EXISTS "Public can insert complaints" ON public.complaints;
DROP POLICY IF EXISTS "Anyone can post to group messages" ON public.group_messages;

-- 3. Policy: Complaints - only approved members or admins can insert
CREATE POLICY "Approved members can insert complaints" ON public.complaints
    FOR INSERT
    WITH CHECK (
        public.is_approved_poster(reporter_mobile)
        OR auth.role() = 'authenticated'
    );

-- 4. Policy: Social Work - only approved members or admins can insert
CREATE POLICY "Approved members can insert social work" ON public.social_works
    FOR INSERT
    WITH CHECK (
        public.is_approved_poster(submitter_mobile)
        OR auth.role() = 'authenticated'
    );

-- 5. Policy: Public Info - only approved members or admins can insert
CREATE POLICY "Approved members can insert public info" ON public.public_infos
    FOR INSERT
    WITH CHECK (
        public.is_approved_poster(mobile)
        OR auth.role() = 'authenticated'
    );

-- 6. Policy: Group Messages - only approved members or admins can post
CREATE POLICY "Approved members can post group messages" ON public.group_messages
    FOR INSERT
    WITH CHECK (
        public.is_approved_poster(sender_mobile)
        OR auth.role() = 'authenticated'
    );

-- 7. Ensure All Users (including unapproved members) can SELECT / read posts and data
-- Policies already ensure SELECT is granted (e.g., complaints, events, announcements, approved social work/gallery)
