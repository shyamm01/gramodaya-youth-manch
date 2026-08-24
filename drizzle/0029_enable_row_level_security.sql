-- ============================================================================
-- 0029 · ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
-- Supabase platform concern, kept in this migration set rather than a second
-- supabase/migrations directory so there is one ordered history to reason about.
--
-- Model:
--   * Reference/geography and published community content are world-readable —
--     the public site renders them for visitors who never sign in.
--   * Writes require an authenticated session; the moderation tables require an
--     ADMIN or SUPER_ADMIN profile.
--   * Server-side routes connect over DATABASE_URL as the table owner and are
--     not subject to these policies; they exist to constrain the anon and
--     authenticated PostgREST keys shipped to the browser.
-- ============================================================================

-- Helper: is the caller an administrator? -------------------------------------
CREATE OR REPLACE FUNCTION gym_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
     WHERE id = auth.uid()
       AND system_role IN ('ADMIN', 'SUPER_ADMIN')
  );
$fn$;
--> statement-breakpoint

-- Enable RLS on every table ---------------------------------------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'states', 'districts', 'gram_panchayats', 'villages',
    'profiles', 'modules', 'user_permissions', 'user_village_roles',
    'complaint_categories', 'complaints', 'complaint_attachments', 'complaint_status_history',
    'social_works', 'events', 'gallery', 'elders', 'announcements', 'public_infos',
    'education_categories', 'education_resources', 'education_resource_links', 'education_enquiries',
    'chat_rooms', 'chat_members', 'chat_messages', 'audit_logs'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;
--> statement-breakpoint

-- Public read on reference data and published content -------------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'states', 'districts', 'gram_panchayats', 'villages',
    'modules', 'complaint_categories',
    'complaints', 'complaint_attachments', 'complaint_status_history',
    'social_works', 'events', 'gallery', 'elders', 'announcements',
    'education_categories', 'education_resources', 'education_resource_links'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "public_read_%s" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "public_read_%s" ON public.%I FOR SELECT USING (true)', t, t);
  END LOOP;
END $$;
--> statement-breakpoint

-- Authenticated writes on the citizen-submission tables ------------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'complaints', 'complaint_attachments', 'social_works', 'public_infos', 'education_enquiries'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "authenticated_insert_%s" ON public.%I', t, t);
    EXECUTE format(
      'CREATE POLICY "authenticated_insert_%s" ON public.%I FOR INSERT TO authenticated WITH CHECK (true)', t, t);
  END LOOP;
END $$;
--> statement-breakpoint

-- Admin-only management on the moderated tables -------------------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'states', 'districts', 'gram_panchayats', 'villages', 'modules',
    'complaint_categories', 'complaints', 'complaint_attachments', 'complaint_status_history',
    'social_works', 'events', 'gallery', 'elders', 'announcements', 'public_infos',
    'education_categories', 'education_resources', 'education_resource_links', 'education_enquiries',
    'user_permissions', 'user_village_roles', 'chat_rooms'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "admin_manage_%s" ON public.%I', t, t);
    EXECUTE format(
      'CREATE POLICY "admin_manage_%s" ON public.%I FOR ALL TO authenticated USING (gym_is_admin()) WITH CHECK (gym_is_admin())',
      t, t);
  END LOOP;
END $$;
--> statement-breakpoint

-- profiles --------------------------------------------------------------------
-- The member directory shows active members; a pending member can still see
-- their own row so the "awaiting approval" screen works.
DROP POLICY IF EXISTS "Public can view active profiles" ON public.profiles;
--> statement-breakpoint
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
--> statement-breakpoint
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
--> statement-breakpoint
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
--> statement-breakpoint
DROP POLICY IF EXISTS "profiles_read" ON public.profiles;
--> statement-breakpoint
CREATE POLICY "profiles_read" ON public.profiles
  FOR SELECT
  USING (status = 'active' OR (SELECT auth.uid()) = id OR gym_is_admin());
--> statement-breakpoint
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
--> statement-breakpoint
CREATE POLICY "profiles_insert_self" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);
--> statement-breakpoint
DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
--> statement-breakpoint
CREATE POLICY "profiles_update_self" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);
--> statement-breakpoint
DROP POLICY IF EXISTS "profiles_admin_manage" ON public.profiles;
--> statement-breakpoint
CREATE POLICY "profiles_admin_manage" ON public.profiles
  FOR ALL TO authenticated
  USING (gym_is_admin()) WITH CHECK (gym_is_admin());
--> statement-breakpoint

-- user_permissions / user_village_roles: a member may read their own grants ----
DROP POLICY IF EXISTS "user_permissions_read_own" ON public.user_permissions;
--> statement-breakpoint
CREATE POLICY "user_permissions_read_own" ON public.user_permissions
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR gym_is_admin());
--> statement-breakpoint
DROP POLICY IF EXISTS "user_village_roles_read_own" ON public.user_village_roles;
--> statement-breakpoint
CREATE POLICY "user_village_roles_read_own" ON public.user_village_roles
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR gym_is_admin());
--> statement-breakpoint

-- Chat: members of a room read and write it -----------------------------------
DROP POLICY IF EXISTS "chat_messages_read_room_members" ON public.chat_messages;
--> statement-breakpoint
CREATE POLICY "chat_messages_read_room_members" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (
    is_deleted = false
    AND EXISTS (
      SELECT 1 FROM public.chat_members m
       WHERE m.room_id = chat_messages.room_id AND m.user_id = (SELECT auth.uid())
    )
  );
--> statement-breakpoint
DROP POLICY IF EXISTS "chat_messages_insert_as_self" ON public.chat_messages;
--> statement-breakpoint
CREATE POLICY "chat_messages_insert_as_self" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.chat_members m
       WHERE m.room_id = chat_messages.room_id AND m.user_id = (SELECT auth.uid())
    )
  );
--> statement-breakpoint
DROP POLICY IF EXISTS "chat_members_read_own_rooms" ON public.chat_members;
--> statement-breakpoint
CREATE POLICY "chat_members_read_own_rooms" ON public.chat_members
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.chat_members mine
       WHERE mine.room_id = chat_members.room_id AND mine.user_id = (SELECT auth.uid())
    )
  );
--> statement-breakpoint
DROP POLICY IF EXISTS "chat_members_manage_own" ON public.chat_members;
--> statement-breakpoint
CREATE POLICY "chat_members_manage_own" ON public.chat_members
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()) OR gym_is_admin())
  WITH CHECK (user_id = (SELECT auth.uid()) OR gym_is_admin());
--> statement-breakpoint

-- Audit logs: administrators only ---------------------------------------------
DROP POLICY IF EXISTS "audit_logs_admin_read" ON public.audit_logs;
--> statement-breakpoint
CREATE POLICY "audit_logs_admin_read" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (gym_is_admin());
--> statement-breakpoint

-- Retire the policy names the earlier history created --------------------------
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname
      FROM pg_policies
     WHERE schemaname = 'public'
       AND policyname LIKE 'Public read %'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, p.tablename);
  END LOOP;
END $$;
