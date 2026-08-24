-- ============================================================================
-- 0017 · elders (बुजुर्ग सम्मान सूची)
-- ----------------------------------------------------------------------------
-- Honour board of village seniors. Kept separate from `profiles` on purpose:
-- an elder is listed by the community and generally has no login account, so
-- these rows are content rather than identities.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "elders" (
  "id"            bigserial PRIMARY KEY NOT NULL,
  "village_id"    bigint,
  "name"          text NOT NULL,
  "age"           text NOT NULL,
  "role"          text,
  "contribution"  text,
  "photo_url"     text,
  "created_at"    timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"    timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Foreign keys ---------------------------------------------------------------
SELECT gym_drop_foreign_keys('elders', 'village_id');
--> statement-breakpoint
UPDATE "elders" e SET "village_id" = NULL
 WHERE "village_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "villages" v WHERE v."id" = e."village_id");
--> statement-breakpoint
ALTER TABLE "elders"
  ADD CONSTRAINT "elders_village_id_villages_id_fk"
  FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "idx_elders_village_id" ON "elders" USING btree ("village_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_elders_name"       ON "elders" USING btree ("name");
--> statement-breakpoint

SELECT gym_attach_updated_at('elders');
