-- ============================================================================
-- 0016 · gallery (ग्राम चित्रशाला)
-- ----------------------------------------------------------------------------
-- Community photo archive.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "gallery" (
  "id"                  bigserial PRIMARY KEY NOT NULL,
  "village_id"          bigint,
  "caption"             text,
  "photo_url"           text NOT NULL,
  "uploaded_by"         text DEFAULT 'Admin' NOT NULL,
  "uploaded_by_mobile"  text,
  "date"                date DEFAULT CURRENT_DATE NOT NULL,
  "status"              "gallery_status" DEFAULT 'published' NOT NULL,
  "created_at"          timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"          timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Reconcile ------------------------------------------------------------------
ALTER TABLE "gallery" ADD COLUMN IF NOT EXISTS "uploaded_by_mobile" text;
--> statement-breakpoint
SELECT gym_cast_column_to_enum('gallery', 'status', 'gallery_status', 'published');
--> statement-breakpoint

-- Foreign keys ---------------------------------------------------------------
SELECT gym_drop_foreign_keys('gallery', 'village_id');
--> statement-breakpoint
UPDATE "gallery" g SET "village_id" = NULL
 WHERE "village_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "villages" v WHERE v."id" = g."village_id");
--> statement-breakpoint
ALTER TABLE "gallery"
  ADD CONSTRAINT "gallery_village_id_villages_id_fk"
  FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "idx_gallery_village_id" ON "gallery" USING btree ("village_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gallery_status"     ON "gallery" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gallery_date"       ON "gallery" USING btree ("date");
--> statement-breakpoint

SELECT gym_attach_updated_at('gallery');
