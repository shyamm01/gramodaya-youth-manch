-- ============================================================================
-- 0002 · states (राज्य)
-- ----------------------------------------------------------------------------
-- Root of the geography hierarchy: states -> districts -> gram_panchayats ->
-- villages. Every place name in the system resolves through this chain rather
-- than being repeated as free text on member and content rows.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "states" (
  "id"         bigserial PRIMARY KEY NOT NULL,
  "name"       text NOT NULL,
  "name_hindi" text NOT NULL,
  "code"       text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Reconcile ------------------------------------------------------------------
ALTER TABLE "states" ADD COLUMN IF NOT EXISTS "name_hindi" text;
--> statement-breakpoint
UPDATE "states" SET "name_hindi" = COALESCE("name_hindi", "name") WHERE "name_hindi" IS NULL;
--> statement-breakpoint
ALTER TABLE "states" ALTER COLUMN "name_hindi" SET NOT NULL;
--> statement-breakpoint

-- A single named unique index carries the uniqueness of `code`. The older
-- history also left a table-level UNIQUE constraint behind, which produced a
-- second, redundant index on the same column.
ALTER TABLE "states" DROP CONSTRAINT IF EXISTS "states_code_key";
--> statement-breakpoint
ALTER TABLE "states" DROP CONSTRAINT IF EXISTS "states_code_unique";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_states_code";
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_states_code" ON "states" USING btree ("code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_states_name" ON "states" USING btree ("name");
