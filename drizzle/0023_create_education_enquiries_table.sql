-- ============================================================================
-- 0023 · education_enquiries (शिक्षा सहायता अनुरोध)
-- ----------------------------------------------------------------------------
-- A student or parent asking for help with a scheme. user_id is nullable: the
-- enquiry form is open to visitors who have not registered, and name / mobile
-- are captured on the row for exactly that case.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "education_enquiries" (
  "id"             bigserial PRIMARY KEY NOT NULL,
  "village_id"     bigint,
  "resource_id"    bigint,
  "category_id"    bigint,
  "user_id"        uuid,
  "name"           text NOT NULL,
  "mobile"         text NOT NULL,
  "email"          text,
  "student_class"  text,
  "message"        text NOT NULL,
  "status"         "education_enquiry_status" DEFAULT 'new' NOT NULL,
  "assigned_to"    uuid,
  "response"       text,
  "resolved_at"    timestamp with time zone,
  "created_at"     timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"     timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Foreign keys ---------------------------------------------------------------
SELECT gym_drop_foreign_keys('education_enquiries', 'village_id');
--> statement-breakpoint
UPDATE "education_enquiries" e SET "village_id" = NULL
 WHERE "village_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "villages" v WHERE v."id" = e."village_id");
--> statement-breakpoint
ALTER TABLE "education_enquiries"
  ADD CONSTRAINT "education_enquiries_village_id_villages_id_fk"
  FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- SET NULL, not CASCADE: the enquiry and its answer stay on record even if the
-- scheme it was about is later removed from the catalogue.
SELECT gym_drop_foreign_keys('education_enquiries', 'resource_id');
--> statement-breakpoint
UPDATE "education_enquiries" e SET "resource_id" = NULL
 WHERE "resource_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "education_resources" r WHERE r."id" = e."resource_id");
--> statement-breakpoint
ALTER TABLE "education_enquiries"
  ADD CONSTRAINT "education_enquiries_resource_id_education_resources_id_fk"
  FOREIGN KEY ("resource_id") REFERENCES "public"."education_resources"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

SELECT gym_drop_foreign_keys('education_enquiries', 'category_id');
--> statement-breakpoint
UPDATE "education_enquiries" e SET "category_id" = NULL
 WHERE "category_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "education_categories" c WHERE c."id" = e."category_id");
--> statement-breakpoint
ALTER TABLE "education_enquiries"
  ADD CONSTRAINT "education_enquiries_category_id_education_categories_id_fk"
  FOREIGN KEY ("category_id") REFERENCES "public"."education_categories"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

SELECT gym_drop_foreign_keys('education_enquiries', 'user_id');
--> statement-breakpoint
UPDATE "education_enquiries" e SET "user_id" = NULL
 WHERE "user_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "profiles" p WHERE p."id" = e."user_id");
--> statement-breakpoint
ALTER TABLE "education_enquiries"
  ADD CONSTRAINT "education_enquiries_user_id_profiles_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

SELECT gym_drop_foreign_keys('education_enquiries', 'assigned_to');
--> statement-breakpoint
UPDATE "education_enquiries" e SET "assigned_to" = NULL
 WHERE "assigned_to" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "profiles" p WHERE p."id" = e."assigned_to");
--> statement-breakpoint
ALTER TABLE "education_enquiries"
  ADD CONSTRAINT "education_enquiries_assigned_to_profiles_id_fk"
  FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "idx_education_enquiries_village_id"  ON "education_enquiries" USING btree ("village_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_enquiries_resource_id" ON "education_enquiries" USING btree ("resource_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_enquiries_status"      ON "education_enquiries" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_enquiries_mobile"      ON "education_enquiries" USING btree ("mobile");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_enquiries_created_at"  ON "education_enquiries" USING btree ("created_at");
--> statement-breakpoint

SELECT gym_attach_updated_at('education_enquiries');
