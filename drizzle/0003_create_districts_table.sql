-- ============================================================================
-- 0003 · districts (जनपद / जिले)
-- ----------------------------------------------------------------------------
-- Level 2 of the geography hierarchy. Belongs to exactly one state.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "districts" (
  "id"         bigserial PRIMARY KEY NOT NULL,
  "state_id"   bigint NOT NULL,
  "name"       text NOT NULL,
  "name_hindi" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Reconcile ------------------------------------------------------------------
ALTER TABLE "districts" ADD COLUMN IF NOT EXISTS "name_hindi" text;
--> statement-breakpoint
UPDATE "districts" SET "name_hindi" = COALESCE("name_hindi", "name") WHERE "name_hindi" IS NULL;
--> statement-breakpoint
ALTER TABLE "districts" ALTER COLUMN "name_hindi" SET NOT NULL;
--> statement-breakpoint

-- Foreign keys ---------------------------------------------------------------
-- RESTRICT: a state that still has districts must not be deletable, otherwise
-- the whole hierarchy below it is orphaned.
SELECT gym_drop_foreign_keys('districts', 'state_id');
--> statement-breakpoint
DELETE FROM "districts" d WHERE NOT EXISTS (SELECT 1 FROM "states" s WHERE s."id" = d."state_id");
--> statement-breakpoint
ALTER TABLE "districts"
  ADD CONSTRAINT "districts_state_id_states_id_fk"
  FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
-- A district name is unique within its state. Without this the table had no
-- natural key at all, so re-running the seed created duplicate districts.
DELETE FROM "districts" a USING "districts" b
 WHERE a."id" > b."id" AND a."state_id" = b."state_id" AND lower(a."name") = lower(b."name");
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_districts_state_name";
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_districts_state_name"
  ON "districts" USING btree ("state_id", lower("name"));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_districts_state_id" ON "districts" USING btree ("state_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_districts_name" ON "districts" USING btree ("name");
