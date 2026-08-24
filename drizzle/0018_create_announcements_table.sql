-- ============================================================================
-- 0018 · announcements (ग्राम घोषणाएं एवं सूचनाएं)
-- ----------------------------------------------------------------------------
-- Official panchayat notices on the notice board.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "announcements" (
  "id"            bigserial PRIMARY KEY NOT NULL,
  "village_id"    bigint,
  "title"         text NOT NULL,
  "content"       text NOT NULL,
  "date"          date DEFAULT CURRENT_DATE NOT NULL,
  "published_by"  text DEFAULT 'ग्रामोदय यूथ मंच' NOT NULL,
  "is_urgent"     boolean DEFAULT false NOT NULL,
  "created_at"    timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"    timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Reconcile ------------------------------------------------------------------
UPDATE "announcements" SET "is_urgent" = false WHERE "is_urgent" IS NULL;
--> statement-breakpoint
ALTER TABLE "announcements" ALTER COLUMN "is_urgent" SET DEFAULT false;
--> statement-breakpoint
ALTER TABLE "announcements" ALTER COLUMN "is_urgent" SET NOT NULL;
--> statement-breakpoint

-- Foreign keys ---------------------------------------------------------------
SELECT gym_drop_foreign_keys('announcements', 'village_id');
--> statement-breakpoint
UPDATE "announcements" a SET "village_id" = NULL
 WHERE "village_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "villages" v WHERE v."id" = a."village_id");
--> statement-breakpoint
ALTER TABLE "announcements"
  ADD CONSTRAINT "announcements_village_id_villages_id_fk"
  FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "idx_announcements_village_id" ON "announcements" USING btree ("village_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_announcements_date"       ON "announcements" USING btree ("date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_announcements_is_urgent"  ON "announcements" USING btree ("is_urgent");
--> statement-breakpoint

SELECT gym_attach_updated_at('announcements');
