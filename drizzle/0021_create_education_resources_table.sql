-- ============================================================================
-- 0021 · education_resources (योजनाएं, छात्रवृत्ति, मार्गदर्शन)
-- ----------------------------------------------------------------------------
-- One card on an education category page: a scheme, scholarship, course,
-- institution or guidance item. Long-form detail fields are all optional, so a
-- minimal card (title + description) is still a valid row.
--
-- Each English detail field has a Hindi twin, because the village site defaults
-- to Hindi and English-only detail text would be the wrong language for most of
-- its readers; NULL falls back to the English column.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "education_resources" (
  "id"                        bigserial PRIMARY KEY NOT NULL,
  "category_id"               bigint NOT NULL,
  "village_id"                bigint,
  "slug"                      text NOT NULL,
  "title"                     text NOT NULL,
  "title_hindi"               text,
  "title_key"                 text,
  "description"               text,
  "description_hindi"         text,
  "description_key"           text,
  "icon"                      text DEFAULT 'BookOpen' NOT NULL,
  "scope"                     "education_scope" DEFAULT 'government' NOT NULL,
  "type"                      "education_resource_type" DEFAULT 'scheme' NOT NULL,
  "status"                    "education_status" DEFAULT 'published' NOT NULL,
  "eligibility"               text,
  "eligibility_hindi"         text,
  "benefits"                  text,
  "benefits_hindi"            text,
  "how_to_apply"              text,
  "how_to_apply_hindi"        text,
  "documents_required"        jsonb,
  "documents_required_hindi"  jsonb,
  "tags"                      jsonb,
  "provider"                  text,
  "provider_hindi"            text,
  "external_url"              text,
  "photo_url"                 text,
  "contact_name"              text,
  "contact_mobile"            text,
  "start_date"                date,
  "end_date"                  date,
  "cta_label"                 text,
  "cta_label_hindi"           text,
  "display_order"             integer DEFAULT 0 NOT NULL,
  "metadata"                  jsonb,
  "created_by"                uuid,
  "created_at"                timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"                timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Reconcile: fields added after the table first shipped ----------------------
ALTER TABLE "education_resources" ADD COLUMN IF NOT EXISTS "cta_label"                text;
--> statement-breakpoint
ALTER TABLE "education_resources" ADD COLUMN IF NOT EXISTS "cta_label_hindi"          text;
--> statement-breakpoint
ALTER TABLE "education_resources" ADD COLUMN IF NOT EXISTS "eligibility_hindi"        text;
--> statement-breakpoint
ALTER TABLE "education_resources" ADD COLUMN IF NOT EXISTS "benefits_hindi"           text;
--> statement-breakpoint
ALTER TABLE "education_resources" ADD COLUMN IF NOT EXISTS "how_to_apply_hindi"       text;
--> statement-breakpoint
ALTER TABLE "education_resources" ADD COLUMN IF NOT EXISTS "documents_required_hindi" jsonb;
--> statement-breakpoint
ALTER TABLE "education_resources" ADD COLUMN IF NOT EXISTS "provider_hindi"           text;
--> statement-breakpoint

-- Foreign keys ---------------------------------------------------------------
SELECT gym_drop_foreign_keys('education_resources', 'category_id');
--> statement-breakpoint
DELETE FROM "education_resources" r
 WHERE NOT EXISTS (SELECT 1 FROM "education_categories" c WHERE c."id" = r."category_id");
--> statement-breakpoint
ALTER TABLE "education_resources"
  ADD CONSTRAINT "education_resources_category_id_education_categories_id_fk"
  FOREIGN KEY ("category_id") REFERENCES "public"."education_categories"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

SELECT gym_drop_foreign_keys('education_resources', 'village_id');
--> statement-breakpoint
UPDATE "education_resources" r SET "village_id" = NULL
 WHERE "village_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "villages" v WHERE v."id" = r."village_id");
--> statement-breakpoint
ALTER TABLE "education_resources"
  ADD CONSTRAINT "education_resources_village_id_villages_id_fk"
  FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

SELECT gym_drop_foreign_keys('education_resources', 'created_by');
--> statement-breakpoint
UPDATE "education_resources" r SET "created_by" = NULL
 WHERE "created_by" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "profiles" p WHERE p."id" = r."created_by");
--> statement-breakpoint
ALTER TABLE "education_resources"
  ADD CONSTRAINT "education_resources_created_by_profiles_id_fk"
  FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
DROP INDEX IF EXISTS "idx_education_resources_category_slug";
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_education_resources_category_slug"
  ON "education_resources" USING btree ("category_id", "slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_resources_category_id"   ON "education_resources" USING btree ("category_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_resources_village_id"    ON "education_resources" USING btree ("village_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_resources_status"        ON "education_resources" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_resources_scope"         ON "education_resources" USING btree ("scope");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_resources_type"          ON "education_resources" USING btree ("type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_resources_display_order" ON "education_resources" USING btree ("display_order");
--> statement-breakpoint

SELECT gym_attach_updated_at('education_resources');
