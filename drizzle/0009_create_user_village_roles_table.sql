-- ============================================================================
-- 0009 · user_village_roles (ग्राम स्तर पर उपयोगकर्ता की भूमिका)
-- ----------------------------------------------------------------------------
-- A person's role within a specific village chapter. Separate from
-- profiles.system_role, which is their platform-wide role: an ADMIN of one
-- village is an ordinary MEMBER of another, and that is a fact about the pair,
-- not about the person.
--
-- Fixed here: the live table had `member_id bigint` (dangling reference to the
-- dropped `members` table), no user_id at all, no foreign keys whatsoever, and
-- three duplicate index pairs.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "user_village_roles" (
  "id"          bigserial PRIMARY KEY NOT NULL,
  "user_id"     uuid NOT NULL,
  "village_id"  bigint NOT NULL,
  "role"        "system_role" DEFAULT 'MEMBER' NOT NULL,
  "is_primary"  boolean DEFAULT false NOT NULL,
  "assigned_by" text,
  "created_at"  timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Reconcile: legacy member_id -> user_id -------------------------------------
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'user_village_roles' AND column_name = 'member_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'user_village_roles' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.user_village_roles RENAME COLUMN member_id TO user_id;
    ALTER TABLE public.user_village_roles ALTER COLUMN user_id TYPE uuid USING NULL;
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "user_village_roles" ADD COLUMN IF NOT EXISTS "user_id" uuid;
--> statement-breakpoint
ALTER TABLE "user_village_roles" DROP COLUMN IF EXISTS "member_id";
--> statement-breakpoint

DELETE FROM "user_village_roles" WHERE "user_id" IS NULL OR "village_id" IS NULL;
--> statement-breakpoint
DELETE FROM "user_village_roles" r
 WHERE NOT EXISTS (SELECT 1 FROM "profiles" p WHERE p."id" = r."user_id")
    OR NOT EXISTS (SELECT 1 FROM "villages" v WHERE v."id" = r."village_id");
--> statement-breakpoint
ALTER TABLE "user_village_roles" ALTER COLUMN "user_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "user_village_roles" ALTER COLUMN "village_id" SET NOT NULL;
--> statement-breakpoint

-- One role per person per village.
DELETE FROM "user_village_roles" a
 USING "user_village_roles" b
 WHERE a."id" > b."id" AND a."user_id" = b."user_id" AND a."village_id" = b."village_id";
--> statement-breakpoint

-- Foreign keys ---------------------------------------------------------------
SELECT gym_drop_foreign_keys('user_village_roles', 'user_id');
--> statement-breakpoint
ALTER TABLE "user_village_roles"
  ADD CONSTRAINT "user_village_roles_user_id_profiles_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
SELECT gym_drop_foreign_keys('user_village_roles', 'village_id');
--> statement-breakpoint
ALTER TABLE "user_village_roles"
  ADD CONSTRAINT "user_village_roles_village_id_villages_id_fk"
  FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
DROP INDEX IF EXISTS "idx_user_village_roles_member";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_user_village_roles_user";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_user_village_roles_village";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_user_village_roles_unique";
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_village_roles_unique"
  ON "user_village_roles" USING btree ("user_id", "village_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_village_roles_user_id" ON "user_village_roles" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_village_roles_village_id" ON "user_village_roles" USING btree ("village_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_village_roles_role" ON "user_village_roles" USING btree ("role");
