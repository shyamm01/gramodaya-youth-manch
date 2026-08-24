-- ============================================================================
-- 0004 · gram_panchayats (ग्राम पंचायतें)
-- ----------------------------------------------------------------------------
-- Level 3 of the geography hierarchy. Owns the block / pincode / post office
-- attributes, which villages inherit through gram_panchayat_id rather than
-- storing their own copies.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "gram_panchayats" (
  "id"                bigserial PRIMARY KEY NOT NULL,
  "district_id"       bigint NOT NULL,
  "name"              text NOT NULL,
  "name_hindi"        text NOT NULL,
  "block_name"        text,
  "block_name_hindi"  text,
  "pincode"           text,
  "post_office"       text,
  "is_active"         boolean DEFAULT true NOT NULL,
  "created_at"        timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"        timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Reconcile ------------------------------------------------------------------
ALTER TABLE "gram_panchayats" ADD COLUMN IF NOT EXISTS "block_name" text;
--> statement-breakpoint
ALTER TABLE "gram_panchayats" ADD COLUMN IF NOT EXISTS "block_name_hindi" text;
--> statement-breakpoint
ALTER TABLE "gram_panchayats" ADD COLUMN IF NOT EXISTS "pincode" text;
--> statement-breakpoint
ALTER TABLE "gram_panchayats" ADD COLUMN IF NOT EXISTS "post_office" text;
--> statement-breakpoint
ALTER TABLE "gram_panchayats" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true;
--> statement-breakpoint
ALTER TABLE "gram_panchayats" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();
--> statement-breakpoint
UPDATE "gram_panchayats" SET "is_active" = true WHERE "is_active" IS NULL;
--> statement-breakpoint
UPDATE "gram_panchayats" SET "updated_at" = COALESCE("updated_at", "created_at", now()) WHERE "updated_at" IS NULL;
--> statement-breakpoint
ALTER TABLE "gram_panchayats" ALTER COLUMN "is_active" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "gram_panchayats" ALTER COLUMN "updated_at" SET NOT NULL;
--> statement-breakpoint

-- These per-row literal defaults were a Rasoolpur-specific artefact: a panchayat
-- in another district would silently inherit Hardoi's block and pincode.
ALTER TABLE "gram_panchayats" ALTER COLUMN "block_name" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "gram_panchayats" ALTER COLUMN "block_name_hindi" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "gram_panchayats" ALTER COLUMN "pincode" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "gram_panchayats" ALTER COLUMN "post_office" DROP DEFAULT;
--> statement-breakpoint

-- Foreign keys ---------------------------------------------------------------
-- The live database carried two contradictory constraints on this column: one
-- ON DELETE SET NULL and one ON DELETE RESTRICT, on a NOT NULL column — the
-- SET NULL rule could only ever have raised an error. Collapsed to RESTRICT.
SELECT gym_drop_foreign_keys('gram_panchayats', 'district_id');
--> statement-breakpoint
DELETE FROM "gram_panchayats" g WHERE NOT EXISTS (SELECT 1 FROM "districts" d WHERE d."id" = g."district_id");
--> statement-breakpoint
ALTER TABLE "gram_panchayats"
  ADD CONSTRAINT "gram_panchayats_district_id_districts_id_fk"
  FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
-- A panchayat name is unique within its district — the missing natural key that
-- let repeated seeding create duplicate panchayats.
DELETE FROM "gram_panchayats" a USING "gram_panchayats" b
 WHERE a."id" > b."id" AND a."district_id" = b."district_id" AND lower(a."name") = lower(b."name");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_gram_panchayats_district_name"
  ON "gram_panchayats" USING btree ("district_id", lower("name"));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gram_panchayats_district_id" ON "gram_panchayats" USING btree ("district_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gram_panchayats_name" ON "gram_panchayats" USING btree ("name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gram_panchayats_pincode" ON "gram_panchayats" USING btree ("pincode");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gram_panchayats_is_active" ON "gram_panchayats" USING btree ("is_active");
--> statement-breakpoint

SELECT gym_attach_updated_at('gram_panchayats');
