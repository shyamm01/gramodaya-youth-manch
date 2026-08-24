-- ============================================================================
-- 0011 · complaints (ग्राम स्तर की समस्याएं)
-- ----------------------------------------------------------------------------
-- One grievance. Everything about a grievance that repeats lives elsewhere:
--   category   -> complaint_categories via category_id   (0010)
--   media      -> complaint_attachments                  (0012)
--   status log -> complaint_status_history               (0013)
--
-- Columns removed here (each was a second copy of one of those):
--   category   complaint_category  — mirrored category_id; the two could and
--                                    did disagree, and adding a category meant
--                                    altering an enum type
--   photo_url  / video_url         — mirrored the first photo/video attachment,
--                                    and capped a grievance at one of each
--   member_id  bigint              — dangling reference to the dropped
--                                    `members` table, superseded by user_id
-- ============================================================================

CREATE TABLE IF NOT EXISTS "complaints" (
  "id"                bigserial PRIMARY KEY NOT NULL,
  "village_id"        bigint,
  "user_id"           uuid,
  "category_id"       bigint,
  "title"             text NOT NULL,
  "title_hindi"       text,
  "description"       text NOT NULL,
  "description_hindi" text,
  "location"          text NOT NULL,
  "location_hindi"    text,
  "ward"              text,
  "ward_hindi"        text,
  "reporter_name"     text NOT NULL,
  "reporter_mobile"   text NOT NULL,
  "status"            "complaint_status" DEFAULT 'NEW' NOT NULL,
  "priority"          "complaint_priority" DEFAULT 'medium' NOT NULL,
  "is_active"         boolean DEFAULT true NOT NULL,
  "resolved_at"       timestamp with time zone,
  "created_at"        timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"        timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Reconcile: columns ---------------------------------------------------------
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "category_id"       bigint;
--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "title_hindi"       text;
--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "description_hindi" text;
--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "location_hindi"    text;
--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "ward"              text;
--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "ward_hindi"        text;
--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "priority" "complaint_priority" DEFAULT 'medium' NOT NULL;
--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "resolved_at" timestamp with time zone;
--> statement-breakpoint

-- An earlier revision called this is_demo before it came to mean "visible".
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema='public' AND table_name='complaints' AND column_name='is_demo')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema='public' AND table_name='complaints' AND column_name='is_active') THEN
    ALTER TABLE public.complaints RENAME COLUMN is_demo TO is_active;
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true;
--> statement-breakpoint
UPDATE "complaints" SET "is_active" = true WHERE "is_active" IS NULL;
--> statement-breakpoint
ALTER TABLE "complaints" ALTER COLUMN "is_active" SET DEFAULT true;
--> statement-breakpoint
ALTER TABLE "complaints" ALTER COLUMN "is_active" SET NOT NULL;
--> statement-breakpoint

-- Reconcile: user_id ---------------------------------------------------------
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "user_id" uuid;
--> statement-breakpoint
ALTER TABLE "complaints" DROP COLUMN IF EXISTS "member_id";
--> statement-breakpoint

-- Reconcile: fold the `category` enum column into category_id ----------------
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema='public' AND table_name='complaints' AND column_name='category') THEN
    UPDATE public.complaints c
       SET category_id = cc.id
      FROM public.complaint_categories cc
     WHERE c.category_id IS NULL
       AND lower(c.category::text) = lower(cc.name);
  END IF;
END $$;
--> statement-breakpoint
-- Anything still unclassified lands in "Other" rather than losing its category.
UPDATE "complaints" c
   SET "category_id" = (SELECT "id" FROM "complaint_categories" WHERE "slug" = 'other')
 WHERE "category_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "complaints" DROP COLUMN IF EXISTS "category";
--> statement-breakpoint

-- Reconcile: fold photo_url / video_url into complaint_attachments -----------
-- 0012 creates that table, so the move happens there; here the columns are
-- only dropped once 0012 has run. The DO block is a no-op on a fresh database.
-- (Ordering note: attachments are created in 0012 and this drop is repeated
--  there as the final step, so a database applying the set in order never
--  loses media.)

-- Reconcile: status / location ----------------------------------------------
SELECT gym_cast_column_to_enum('complaints', 'status', 'complaint_status', 'NEW');
--> statement-breakpoint
UPDATE "complaints" SET "location" = 'रसूलपुर' WHERE btrim(COALESCE("location", '')) = '';
--> statement-breakpoint
ALTER TABLE "complaints" ALTER COLUMN "location" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "complaints" ALTER COLUMN "location" SET NOT NULL;
--> statement-breakpoint

-- Foreign keys ---------------------------------------------------------------
SELECT gym_drop_foreign_keys('complaints', 'village_id');
--> statement-breakpoint
UPDATE "complaints" c SET "village_id" = NULL
 WHERE "village_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "villages" v WHERE v."id" = c."village_id");
--> statement-breakpoint
ALTER TABLE "complaints"
  ADD CONSTRAINT "complaints_village_id_villages_id_fk"
  FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- SET NULL, not CASCADE: a resolved grievance is village record-keeping and
-- must survive the reporter deleting their account.
SELECT gym_drop_foreign_keys('complaints', 'user_id');
--> statement-breakpoint
UPDATE "complaints" c SET "user_id" = NULL
 WHERE "user_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "profiles" p WHERE p."id" = c."user_id");
--> statement-breakpoint
ALTER TABLE "complaints"
  ADD CONSTRAINT "complaints_user_id_profiles_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

SELECT gym_drop_foreign_keys('complaints', 'category_id');
--> statement-breakpoint
ALTER TABLE "complaints"
  ADD CONSTRAINT "complaints_category_id_complaint_categories_id_fk"
  FOREIGN KEY ("category_id") REFERENCES "public"."complaint_categories"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
DROP INDEX IF EXISTS "idx_complaints_category";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_complaints_member_id";
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_complaints_village_id"     ON "complaints" USING btree ("village_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_complaints_user_id"        ON "complaints" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_complaints_category_id"    ON "complaints" USING btree ("category_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_complaints_status"         ON "complaints" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_complaints_priority"       ON "complaints" USING btree ("priority");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_complaints_is_active"      ON "complaints" USING btree ("is_active");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_complaints_created_at"     ON "complaints" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_complaints_village_status" ON "complaints" USING btree ("village_id", "status");
--> statement-breakpoint

-- Replaces the ad-hoc trg_complaints_updated_at / update_updated_at_column()
-- pair that existed only on this one table; 0028 drops the orphaned function.
SELECT gym_attach_updated_at('complaints');
