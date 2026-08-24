-- ============================================================================
-- 0005 · villages (ग्राम इकाइयां — multi-tenant hub)
-- ----------------------------------------------------------------------------
-- Level 4 of the geography hierarchy and the tenancy root: every piece of
-- content in the platform hangs off a village_id. Also carries the per-chapter
-- branding (org name, slogan, contact) that the public site renders.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "villages" (
  "id"                 bigserial PRIMARY KEY NOT NULL,
  "slug"               text NOT NULL,
  "name"               text NOT NULL,
  "name_hindi"         text NOT NULL,
  "gram_panchayat_id"  bigint,
  "block_name"         text,
  "block_name_hindi"   text,
  "pincode"            text,
  "post_office"        text,
  "org_name"           text DEFAULT 'Gramodaya Youth Manch' NOT NULL,
  "org_name_hindi"     text DEFAULT 'ग्रामोदय यूथ मंच' NOT NULL,
  "slogan_hindi"       text DEFAULT 'युवा शक्ति • ग्राम विकास • उज्ज्वल भविष्य',
  "tagline_hindi"      text DEFAULT 'युवा शक्ति से ग्रामोदय की ओर',
  "org_purpose_hindi"  text,
  "contact_mobile"     text,
  "contact_email"      text,
  "banner_photo_url"   text,
  "is_active"          boolean DEFAULT true NOT NULL,
  "created_at"         timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"         timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Reconcile ------------------------------------------------------------------
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "block_name" text;
--> statement-breakpoint
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "block_name_hindi" text;
--> statement-breakpoint
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "pincode" text;
--> statement-breakpoint
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "post_office" text;
--> statement-breakpoint
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "org_purpose_hindi" text;
--> statement-breakpoint
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "contact_mobile" text;
--> statement-breakpoint
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "contact_email" text;
--> statement-breakpoint
ALTER TABLE "villages" ADD COLUMN IF NOT EXISTS "banner_photo_url" text;
--> statement-breakpoint

-- Same Rasoolpur-specific literal defaults as on gram_panchayats: a new village
-- chapter must not silently inherit Hardoi's block name and pincode.
ALTER TABLE "villages" ALTER COLUMN "block_name" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "villages" ALTER COLUMN "block_name_hindi" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "villages" ALTER COLUMN "pincode" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "villages" ALTER COLUMN "post_office" DROP DEFAULT;
--> statement-breakpoint

-- Foreign keys ---------------------------------------------------------------
-- SET NULL: a village chapter outlives a panchayat boundary redraw.
SELECT gym_drop_foreign_keys('villages', 'gram_panchayat_id');
--> statement-breakpoint
UPDATE "villages" v SET "gram_panchayat_id" = NULL
 WHERE "gram_panchayat_id" IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM "gram_panchayats" g WHERE g."id" = v."gram_panchayat_id");
--> statement-breakpoint
ALTER TABLE "villages"
  ADD CONSTRAINT "villages_gram_panchayat_id_gram_panchayats_id_fk"
  FOREIGN KEY ("gram_panchayat_id") REFERENCES "public"."gram_panchayats"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
ALTER TABLE "villages" DROP CONSTRAINT IF EXISTS "villages_slug_key";
--> statement-breakpoint
ALTER TABLE "villages" DROP CONSTRAINT IF EXISTS "villages_slug_unique";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_villages_slug";
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_villages_slug" ON "villages" USING btree ("slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_villages_name" ON "villages" USING btree ("name");
--> statement-breakpoint
-- The history left two indexes on gram_panchayat_id under different names.
DROP INDEX IF EXISTS "idx_villages_gram_panchayat_id";
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_villages_panchayat_id" ON "villages" USING btree ("gram_panchayat_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_villages_pincode" ON "villages" USING btree ("pincode");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_villages_is_active" ON "villages" USING btree ("is_active");
--> statement-breakpoint

SELECT gym_attach_updated_at('villages');
