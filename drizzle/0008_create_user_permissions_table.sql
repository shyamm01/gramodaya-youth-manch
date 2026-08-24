-- ============================================================================
-- 0008 · user_permissions (उपयोगकर्ता स्तर की मॉड्यूल अनुमतियां)
-- ----------------------------------------------------------------------------
-- Junction between profiles and modules carrying the CRUD grant, scoped to a
-- level of the geography hierarchy (role_scope) and optionally to one row at
-- that level (scope_id).
--
-- Fixed here: the column was still `member_id bigint` pointing at the dropped
-- `members` table on some databases, which is what made /api/auth/me fail with
-- "column user_id does not exist".
-- ============================================================================

CREATE TABLE IF NOT EXISTS "user_permissions" (
  "id"          bigserial PRIMARY KEY NOT NULL,
  "user_id"     uuid NOT NULL,
  "module_id"   bigint NOT NULL,
  "can_read"    boolean DEFAULT false NOT NULL,
  "can_write"   boolean DEFAULT false NOT NULL,
  "can_update"  boolean DEFAULT false NOT NULL,
  "can_delete"  boolean DEFAULT false NOT NULL,
  "scope_type"  "role_scope" DEFAULT 'VILLAGE' NOT NULL,
  "scope_id"    bigint,
  "granted_by"  text,
  "created_at"  timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"  timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Reconcile: legacy member_id -> user_id -------------------------------------
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'user_permissions' AND column_name = 'member_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'user_permissions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.user_permissions RENAME COLUMN member_id TO user_id;
    -- The bigint values addressed the dropped `members` table and cannot be
    -- mapped onto auth UUIDs; the rows are re-granted from the admin UI.
    ALTER TABLE public.user_permissions ALTER COLUMN user_id TYPE uuid USING NULL;
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "user_permissions" DROP COLUMN IF EXISTS "member_id";
--> statement-breakpoint

-- Reconcile: the pre-modules shape keyed grants by permission code string ------
ALTER TABLE "user_permissions" ADD COLUMN IF NOT EXISTS "module_id" bigint;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'user_permissions' AND column_name = 'permission_code'
  ) THEN
    -- 'complaints:view' -> the complaints module; the verb becomes can_read.
    UPDATE public.user_permissions up
       SET module_id = m.id
      FROM public.modules m
     WHERE up.module_id IS NULL
       AND split_part(up.permission_code, ':', 1) = m.slug;
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "user_permissions" DROP COLUMN IF EXISTS "permission_code";
--> statement-breakpoint
ALTER TABLE "user_permissions" DROP COLUMN IF EXISTS "is_granted";
--> statement-breakpoint

ALTER TABLE "user_permissions" ADD COLUMN IF NOT EXISTS "can_read"   boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "user_permissions" ADD COLUMN IF NOT EXISTS "can_write"  boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "user_permissions" ADD COLUMN IF NOT EXISTS "can_update" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "user_permissions" ADD COLUMN IF NOT EXISTS "can_delete" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "user_permissions" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint

-- Rows that lost their subject or their module are not grants any more.
DELETE FROM "user_permissions" WHERE "user_id" IS NULL OR "module_id" IS NULL;
--> statement-breakpoint
DELETE FROM "user_permissions" up
 WHERE NOT EXISTS (SELECT 1 FROM "profiles" p WHERE p."id" = up."user_id")
    OR NOT EXISTS (SELECT 1 FROM "modules" m WHERE m."id" = up."module_id");
--> statement-breakpoint
ALTER TABLE "user_permissions" ALTER COLUMN "user_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "user_permissions" ALTER COLUMN "module_id" SET NOT NULL;
--> statement-breakpoint

-- Collapse duplicate grants for the same (user, module, scope) ----------------
-- Without the unique index below, the same grant could be inserted repeatedly
-- and the effective permission depended on which row a query happened to read.
DELETE FROM "user_permissions" a
 USING "user_permissions" b
 WHERE a."id" > b."id"
   AND a."user_id" = b."user_id"
   AND a."module_id" = b."module_id"
   AND a."scope_type" = b."scope_type"
   AND COALESCE(a."scope_id", -1) = COALESCE(b."scope_id", -1);
--> statement-breakpoint

-- Foreign keys ---------------------------------------------------------------
SELECT gym_drop_foreign_keys('user_permissions', 'user_id');
--> statement-breakpoint
ALTER TABLE "user_permissions"
  ADD CONSTRAINT "user_permissions_user_id_profiles_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
SELECT gym_drop_foreign_keys('user_permissions', 'module_id');
--> statement-breakpoint
ALTER TABLE "user_permissions"
  ADD CONSTRAINT "user_permissions_module_id_modules_id_fk"
  FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
DROP INDEX IF EXISTS "idx_user_permissions_member_id";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_user_permissions_user";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_user_permissions_code";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_user_permissions_unique_grant";
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_permissions_unique_grant"
  ON "user_permissions" USING btree ("user_id", "module_id", "scope_type", (COALESCE("scope_id", -1)));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_permissions_user_id" ON "user_permissions" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_permissions_module_id" ON "user_permissions" USING btree ("module_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_permissions_scope" ON "user_permissions" USING btree ("scope_type", "scope_id");
--> statement-breakpoint

SELECT gym_attach_updated_at('user_permissions');
