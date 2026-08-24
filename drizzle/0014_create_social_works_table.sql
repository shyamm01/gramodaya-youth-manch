-- ============================================================================
-- 0014 · social_works (सामाजिक कार्य)
-- ----------------------------------------------------------------------------
-- Community welfare initiatives submitted by members and moderated by admins.
--
-- Fixed here: user_id was still `bigint` (left over from the dropped `members`
-- table) while the ORM schema declared it a uuid pointing at profiles, so the
-- column could never actually be written to. It has no FK either.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "social_works" (
  "id"                bigserial PRIMARY KEY NOT NULL,
  "village_id"        bigint,
  "user_id"           uuid,
  "title"             text NOT NULL,
  "description"       text NOT NULL,
  "date"              date DEFAULT CURRENT_DATE NOT NULL,
  "location"          text NOT NULL,
  "submitter_name"    text NOT NULL,
  "submitter_mobile"  text NOT NULL,
  "photo_url"         text,
  "video_url"         text,
  "status"            "social_work_status" DEFAULT 'pending' NOT NULL,
  "created_at"        timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"        timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Reconcile: member_id -> user_id, and bigint -> uuid ------------------------
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema='public' AND table_name='social_works' AND column_name='member_id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema='public' AND table_name='social_works' AND column_name='user_id') THEN
    ALTER TABLE public.social_works RENAME COLUMN member_id TO user_id;
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "social_works" ADD COLUMN IF NOT EXISTS "user_id" uuid;
--> statement-breakpoint
DO $$ BEGIN
  IF (SELECT udt_name FROM information_schema.columns
       WHERE table_schema='public' AND table_name='social_works' AND column_name='user_id') <> 'uuid' THEN
    -- The bigint values addressed the dropped `members` table; there is no
    -- mapping onto auth UUIDs, and submitter_name / submitter_mobile still
    -- identify who filed each entry.
    ALTER TABLE public.social_works ALTER COLUMN user_id TYPE uuid USING NULL;
  END IF;
END $$;
--> statement-breakpoint

SELECT gym_cast_column_to_enum('social_works', 'status', 'social_work_status', 'pending');
--> statement-breakpoint
UPDATE "social_works" SET "location" = 'रसूलपुर' WHERE btrim(COALESCE("location", '')) = '';
--> statement-breakpoint
ALTER TABLE "social_works" ALTER COLUMN "location" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "social_works" ALTER COLUMN "location" SET NOT NULL;
--> statement-breakpoint

-- Foreign keys ---------------------------------------------------------------
SELECT gym_drop_foreign_keys('social_works', 'village_id');
--> statement-breakpoint
UPDATE "social_works" s SET "village_id" = NULL
 WHERE "village_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "villages" v WHERE v."id" = s."village_id");
--> statement-breakpoint
ALTER TABLE "social_works"
  ADD CONSTRAINT "social_works_village_id_villages_id_fk"
  FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

SELECT gym_drop_foreign_keys('social_works', 'user_id');
--> statement-breakpoint
UPDATE "social_works" s SET "user_id" = NULL
 WHERE "user_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "profiles" p WHERE p."id" = s."user_id");
--> statement-breakpoint
ALTER TABLE "social_works"
  ADD CONSTRAINT "social_works_user_id_profiles_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
DROP INDEX IF EXISTS "idx_social_works_member_id";
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_social_works_village_id" ON "social_works" USING btree ("village_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_social_works_user_id"    ON "social_works" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_social_works_status"     ON "social_works" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_social_works_date"       ON "social_works" USING btree ("date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_social_works_created_at" ON "social_works" USING btree ("created_at");
--> statement-breakpoint

SELECT gym_attach_updated_at('social_works');
