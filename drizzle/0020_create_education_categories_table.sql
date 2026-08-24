-- ============================================================================
-- 0020 · education_categories (शिक्षा श्रेणियां)
-- ----------------------------------------------------------------------------
-- Top level of the education module:
--   education_categories -> education_resources -> education_resource_links
--
-- village_id is nullable by design: NULL means platform-wide content shared by
-- every village chapter, a value means the row belongs to that chapter only.
-- The *_key columns hold i18n keys so seeded content keeps using the locale
-- files, while admin-created rows store literal text instead.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "education_categories" (
  "id"              bigserial PRIMARY KEY NOT NULL,
  "village_id"      bigint,
  "slug"            text NOT NULL,
  "name"            text NOT NULL,
  "name_hindi"      text,
  "name_key"        text,
  "overview"        text,
  "overview_hindi"  text,
  "overview_key"    text,
  "icon"            text DEFAULT 'GraduationCap' NOT NULL,
  "display_order"   integer DEFAULT 0 NOT NULL,
  "status"          "education_status" DEFAULT 'published' NOT NULL,
  "metadata"        jsonb,
  "created_by"      uuid,
  "created_at"      timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"      timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Foreign keys ---------------------------------------------------------------
SELECT gym_drop_foreign_keys('education_categories', 'village_id');
--> statement-breakpoint
UPDATE "education_categories" e SET "village_id" = NULL
 WHERE "village_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "villages" v WHERE v."id" = e."village_id");
--> statement-breakpoint
ALTER TABLE "education_categories"
  ADD CONSTRAINT "education_categories_village_id_villages_id_fk"
  FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

SELECT gym_drop_foreign_keys('education_categories', 'created_by');
--> statement-breakpoint
UPDATE "education_categories" e SET "created_by" = NULL
 WHERE "created_by" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "profiles" p WHERE p."id" = e."created_by");
--> statement-breakpoint
ALTER TABLE "education_categories"
  ADD CONSTRAINT "education_categories_created_by_profiles_id_fk"
  FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS "idx_education_categories_village_slug"
  ON "education_categories" USING btree ("village_id", "slug");
--> statement-breakpoint
-- PostgreSQL treats NULLs as distinct in a unique index, so platform-wide rows
-- (village_id IS NULL) need their own partial index to stay unique by slug.
CREATE UNIQUE INDEX IF NOT EXISTS "idx_education_categories_global_slug"
  ON "education_categories" USING btree ("slug") WHERE "village_id" IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_categories_village_id"
  ON "education_categories" USING btree ("village_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_categories_status"
  ON "education_categories" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_categories_display_order"
  ON "education_categories" USING btree ("display_order");
--> statement-breakpoint

SELECT gym_attach_updated_at('education_categories');
