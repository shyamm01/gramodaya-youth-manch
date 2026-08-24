-- ============================================================================
-- 0015 · events (ग्राम कार्यक्रम)
-- ----------------------------------------------------------------------------
-- Village meetings and programmes on the notice board.
--
-- Fixed here: `status` was untyped text carrying DRAFT/PENDING/PUBLISHED/…
-- while the `event_status` enum still held the abandoned upcoming/completed/
-- cancelled labels. 0001 rebuilds the type; this file casts the column onto it,
-- so an invalid status can no longer be written.
--
-- Known limitation, left as-is deliberately: `date` and `time` are text rather
-- than date / time. Correcting them changes the shape the events API and the
-- admin editor exchange, which is an application change rather than a schema
-- normalisation, and is called out in the migration README instead.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "events" (
  "id"           bigserial PRIMARY KEY NOT NULL,
  "village_id"   bigint,
  "title"        text NOT NULL,
  "description"  text,
  "date"         text NOT NULL,
  "time"         text NOT NULL,
  "location"     text NOT NULL,
  "photo_url"    text,
  "video_url"    text,
  "status"       "event_status" DEFAULT 'PUBLISHED' NOT NULL,
  "created_at"   timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"   timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Reconcile ------------------------------------------------------------------
-- Map the retired lifecycle labels onto the current ones before the cast.
UPDATE "events" SET "status" = 'PUBLISHED' WHERE "status"::text = 'upcoming';
--> statement-breakpoint
UPDATE "events" SET "status" = 'COMPLETED' WHERE "status"::text = 'completed';
--> statement-breakpoint
UPDATE "events" SET "status" = 'CANCELLED' WHERE "status"::text = 'cancelled';
--> statement-breakpoint
SELECT gym_cast_column_to_enum('events', 'status', 'event_status', 'PUBLISHED');
--> statement-breakpoint

UPDATE "events" SET "location" = 'रसूलपुर' WHERE btrim(COALESCE("location", '')) = '';
--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "location" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "location" SET NOT NULL;
--> statement-breakpoint
UPDATE "events" SET "time" = '10:00 AM' WHERE btrim(COALESCE("time", '')) = '';
--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "time" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "time" SET NOT NULL;
--> statement-breakpoint

-- Foreign keys ---------------------------------------------------------------
SELECT gym_drop_foreign_keys('events', 'village_id');
--> statement-breakpoint
UPDATE "events" e SET "village_id" = NULL
 WHERE "village_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "villages" v WHERE v."id" = e."village_id");
--> statement-breakpoint
ALTER TABLE "events"
  ADD CONSTRAINT "events_village_id_villages_id_fk"
  FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "idx_events_village_id" ON "events" USING btree ("village_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_status"     ON "events" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_date"       ON "events" USING btree ("date");
--> statement-breakpoint

SELECT gym_attach_updated_at('events');
