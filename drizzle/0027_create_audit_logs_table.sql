-- ============================================================================
-- 0027 · audit_logs (प्रशासनिक अंकेक्षण)
-- ----------------------------------------------------------------------------
-- Append-only record of privileged actions.
--
-- Fixed here: `user_id` was `text` (so the FK to profiles could never be added)
-- and a dead `member_id bigint` pointed at the dropped `members` table.
--
-- user_name is kept alongside user_id on purpose, and is the one place in the
-- schema where a duplicated name is correct: an audit entry has to record who
-- acted at the time of acting, and must stay readable after that account is
-- renamed or deleted. user_id is the live link; user_name is the snapshot.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id"          bigserial PRIMARY KEY NOT NULL,
  "village_id"  bigint,
  "user_id"     uuid,
  "user_name"   text NOT NULL,
  "action"      text NOT NULL,
  "details"     text,
  "ip_address"  text,
  "timestamp"   timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Reconcile ------------------------------------------------------------------
ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "member_id";
--> statement-breakpoint
DO $$ BEGIN
  IF (SELECT udt_name FROM information_schema.columns
       WHERE table_schema='public' AND table_name='audit_logs' AND column_name='user_id') <> 'uuid' THEN
    -- Values that are already well-formed UUIDs are preserved; anything else
    -- (a legacy bigint member id, an empty string) becomes NULL, with the actor
    -- still readable in user_name.
    ALTER TABLE public.audit_logs
      ALTER COLUMN user_id TYPE uuid
      USING (CASE WHEN user_id::text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
                  THEN user_id::text::uuid ELSE NULL END);
  END IF;
END $$;
--> statement-breakpoint
UPDATE "audit_logs" SET "user_name" = 'प्रणाली' WHERE btrim(COALESCE("user_name", '')) = '';
--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "user_name" SET NOT NULL;
--> statement-breakpoint

-- Foreign keys ---------------------------------------------------------------
-- SET NULL on both sides: an audit trail must outlive the village chapter and
-- the account it refers to.
SELECT gym_drop_foreign_keys('audit_logs', 'village_id');
--> statement-breakpoint
UPDATE "audit_logs" a SET "village_id" = NULL
 WHERE "village_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "villages" v WHERE v."id" = a."village_id");
--> statement-breakpoint
ALTER TABLE "audit_logs"
  ADD CONSTRAINT "audit_logs_village_id_villages_id_fk"
  FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

SELECT gym_drop_foreign_keys('audit_logs', 'user_id');
--> statement-breakpoint
UPDATE "audit_logs" a SET "user_id" = NULL
 WHERE "user_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "profiles" p WHERE p."id" = a."user_id");
--> statement-breakpoint
ALTER TABLE "audit_logs"
  ADD CONSTRAINT "audit_logs_user_id_profiles_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
DROP INDEX IF EXISTS "idx_audit_logs_member_id";
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_village_id" ON "audit_logs" USING btree ("village_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_id"    ON "audit_logs" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_timestamp"  ON "audit_logs" USING btree ("timestamp");
