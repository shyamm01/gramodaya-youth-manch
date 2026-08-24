-- ============================================================================
-- 0019 · public_infos (सार्वजनिक सूचना एवं सुझाव)
-- ----------------------------------------------------------------------------
-- Citizen-submitted notices and suggestions awaiting moderation.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "public_infos" (
  "id"                bigserial PRIMARY KEY NOT NULL,
  "village_id"        bigint,
  "title"             text NOT NULL,
  "description"       text NOT NULL,
  "category"          text DEFAULT 'General' NOT NULL,
  "submitter_name"    text NOT NULL,
  "submitter_mobile"  text NOT NULL,
  "status"            "public_info_status" DEFAULT 'pending' NOT NULL,
  "created_at"        timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"        timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Reconcile ------------------------------------------------------------------
UPDATE "public_infos" SET "category" = 'General' WHERE btrim(COALESCE("category", '')) = '';
--> statement-breakpoint
ALTER TABLE "public_infos" ALTER COLUMN "category" SET DEFAULT 'General';
--> statement-breakpoint
ALTER TABLE "public_infos" ALTER COLUMN "category" SET NOT NULL;
--> statement-breakpoint
SELECT gym_cast_column_to_enum('public_infos', 'status', 'public_info_status', 'pending');
--> statement-breakpoint

-- Foreign keys ---------------------------------------------------------------
SELECT gym_drop_foreign_keys('public_infos', 'village_id');
--> statement-breakpoint
UPDATE "public_infos" p SET "village_id" = NULL
 WHERE "village_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "villages" v WHERE v."id" = p."village_id");
--> statement-breakpoint
ALTER TABLE "public_infos"
  ADD CONSTRAINT "public_infos_village_id_villages_id_fk"
  FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "idx_public_infos_village_id" ON "public_infos" USING btree ("village_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_public_infos_status"     ON "public_infos" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_public_infos_created_at" ON "public_infos" USING btree ("created_at");
--> statement-breakpoint

SELECT gym_attach_updated_at('public_infos');
