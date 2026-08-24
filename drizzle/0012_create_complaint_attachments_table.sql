-- ============================================================================
-- 0012 · complaint_attachments (शिकायत संलग्नक)
-- ----------------------------------------------------------------------------
-- Media attached to a grievance. Lifts the repeating group that used to be
-- complaints.photo_url + complaints.video_url out into its own relation, so a
-- grievance can carry any number of photos, videos and documents instead of
-- exactly one of the first two.
--
-- This file is also where the surviving photo_url / video_url values are moved
-- across and the old columns dropped — it has to happen after the table exists.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "complaint_attachments" (
  "id"            bigserial PRIMARY KEY NOT NULL,
  "complaint_id"  bigint NOT NULL,
  "type"          "complaint_attachment_type" DEFAULT 'photo' NOT NULL,
  "url"           text NOT NULL,
  "caption"       text,
  "created_at"    timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Foreign keys ---------------------------------------------------------------
SELECT gym_drop_foreign_keys('complaint_attachments', 'complaint_id');
--> statement-breakpoint
DELETE FROM "complaint_attachments" a
 WHERE NOT EXISTS (SELECT 1 FROM "complaints" c WHERE c."id" = a."complaint_id");
--> statement-breakpoint
ALTER TABLE "complaint_attachments"
  ADD CONSTRAINT "complaint_attachments_complaint_id_complaints_id_fk"
  FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "idx_complaint_attachments_complaint_id"
  ON "complaint_attachments" USING btree ("complaint_id");
--> statement-breakpoint
-- The same file must not be attached to the same grievance twice.
CREATE UNIQUE INDEX IF NOT EXISTS "idx_complaint_attachments_unique_url"
  ON "complaint_attachments" USING btree ("complaint_id", "url");
--> statement-breakpoint

-- Migrate complaints.photo_url / video_url, then retire the columns -----------
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema='public' AND table_name='complaints' AND column_name='photo_url') THEN
    INSERT INTO public.complaint_attachments (complaint_id, type, url)
    SELECT c.id, 'photo'::public.complaint_attachment_type, c.photo_url
      FROM public.complaints c
     WHERE btrim(COALESCE(c.photo_url, '')) <> ''
    ON CONFLICT (complaint_id, url) DO NOTHING;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema='public' AND table_name='complaints' AND column_name='video_url') THEN
    INSERT INTO public.complaint_attachments (complaint_id, type, url)
    SELECT c.id, 'video'::public.complaint_attachment_type, c.video_url
      FROM public.complaints c
     WHERE btrim(COALESCE(c.video_url, '')) <> ''
    ON CONFLICT (complaint_id, url) DO NOTHING;
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "complaints" DROP COLUMN IF EXISTS "photo_url";
--> statement-breakpoint
ALTER TABLE "complaints" DROP COLUMN IF EXISTS "video_url";
