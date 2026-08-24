-- ============================================================================
-- 0030 · REALTIME PUBLICATION & STORAGE BUCKETS
-- ----------------------------------------------------------------------------
-- Supabase platform concern. Guarded throughout so the migration set still
-- applies cleanly to a plain PostgreSQL instance, where neither the
-- supabase_realtime publication nor the storage schema exists.
-- ============================================================================

-- Realtime --------------------------------------------------------------------
-- group_messages, which the old history published, no longer exists; the live
-- feed is chat_messages.
DO $$
DECLARE t text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    RETURN;
  END IF;

  FOREACH t IN ARRAY ARRAY['chat_messages', 'complaints', 'announcements'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;
--> statement-breakpoint

-- Storage buckets --------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                  WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
    RETURN;
  END IF;

  INSERT INTO storage.buckets (id, name, public)
  VALUES
    ('member-photos',     'member-photos',     true),
    ('complaints-media',  'complaints-media',  true),
    ('social-work-media', 'social-work-media', true),
    ('gallery-photos',    'gallery-photos',    true),
    ('education-media',   'education-media',   true)
  ON CONFLICT (id) DO NOTHING;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                  WHERE table_schema = 'storage' AND table_name = 'objects') THEN
    RETURN;
  END IF;

  DROP POLICY IF EXISTS "Public storage object access" ON storage.objects;
  DROP POLICY IF EXISTS "gym_public_bucket_read" ON storage.objects;
  CREATE POLICY "gym_public_bucket_read"
    ON storage.objects FOR SELECT
    USING (bucket_id IN (
      'member-photos', 'complaints-media', 'social-work-media',
      'gallery-photos', 'education-media'
    ));

  DROP POLICY IF EXISTS "gym_authenticated_bucket_write" ON storage.objects;
  CREATE POLICY "gym_authenticated_bucket_write"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id IN (
      'member-photos', 'complaints-media', 'social-work-media',
      'gallery-photos', 'education-media'
    ));
END $$;
