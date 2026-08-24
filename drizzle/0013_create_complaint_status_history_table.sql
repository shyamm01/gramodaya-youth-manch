-- ============================================================================
-- 0013 · complaint_status_history (शिकायत स्थिति इतिहास)
-- ----------------------------------------------------------------------------
-- Append-only audit trail of every status transition on a grievance, with who
-- made it. complaints.status stays as the current value; this table is the
-- record of how it got there, which the citizen-facing tracker renders.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "complaint_status_history" (
  "id"            bigserial PRIMARY KEY NOT NULL,
  "complaint_id"  bigint NOT NULL,
  "from_status"   text,
  "to_status"     text NOT NULL,
  "changed_by"    uuid,
  "note"          text,
  "created_at"    timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Foreign keys ---------------------------------------------------------------
SELECT gym_drop_foreign_keys('complaint_status_history', 'complaint_id');
--> statement-breakpoint
DELETE FROM "complaint_status_history" h
 WHERE NOT EXISTS (SELECT 1 FROM "complaints" c WHERE c."id" = h."complaint_id");
--> statement-breakpoint
ALTER TABLE "complaint_status_history"
  ADD CONSTRAINT "complaint_status_history_complaint_id_complaints_id_fk"
  FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

SELECT gym_drop_foreign_keys('complaint_status_history', 'changed_by');
--> statement-breakpoint
UPDATE "complaint_status_history" h SET "changed_by" = NULL
 WHERE "changed_by" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "profiles" p WHERE p."id" = h."changed_by");
--> statement-breakpoint
ALTER TABLE "complaint_status_history"
  ADD CONSTRAINT "complaint_status_history_changed_by_profiles_id_fk"
  FOREIGN KEY ("changed_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "idx_complaint_status_history_complaint_id"
  ON "complaint_status_history" USING btree ("complaint_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_complaint_status_history_created_at"
  ON "complaint_status_history" USING btree ("created_at");
--> statement-breakpoint

-- Backfill an opening entry for grievances that predate this table, so the
-- tracker never renders a grievance with an empty history.
INSERT INTO "complaint_status_history" ("complaint_id", "from_status", "to_status", "created_at")
SELECT c."id", NULL, c."status"::text, c."created_at"
  FROM "complaints" c
 WHERE NOT EXISTS (
   SELECT 1 FROM "complaint_status_history" h WHERE h."complaint_id" = c."id"
 );
