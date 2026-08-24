-- ============================================================================
-- 0007 · modules (सिस्टम मॉड्यूल्स)
-- ----------------------------------------------------------------------------
-- Canonical catalogue of the features a role can be granted access to
-- (complaints, members, events, …). This is what user_permissions references.
--
-- It supersedes the old `permissions` table, which stored one row per
-- "code" string ('complaints:view', 'complaints:update_status', …) with the
-- module name repeated as free text in a `module` column. That design made the
-- verb part of the key, so every new CRUD verb needed new rows and the module
-- name had no single home. modules + the four can_* booleans on
-- user_permissions express the same grants without the repetition.
--
-- `slug` is immutable by design — permission rows and application code both
-- address modules by slug — and a trigger enforces that.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "modules" (
  "id"             bigserial PRIMARY KEY NOT NULL,
  "slug"           text NOT NULL,
  "name"           text NOT NULL,
  "name_hindi"     text NOT NULL,
  "icon"           text DEFAULT 'Layers' NOT NULL,
  "description"    text,
  "display_order"  integer DEFAULT 0 NOT NULL,
  "is_active"      boolean DEFAULT true NOT NULL,
  "created_at"     timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"     timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Reconcile ------------------------------------------------------------------
ALTER TABLE "modules" ADD COLUMN IF NOT EXISTS "description" text;
--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN IF NOT EXISTS "display_order" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
ALTER TABLE "modules" DROP CONSTRAINT IF EXISTS "modules_slug_key";
--> statement-breakpoint
ALTER TABLE "modules" DROP CONSTRAINT IF EXISTS "modules_slug_unique";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_modules_slug";
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_modules_slug" ON "modules" USING btree ("slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_modules_is_active" ON "modules" USING btree ("is_active");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_modules_display_order" ON "modules" USING btree ("display_order");
--> statement-breakpoint

-- Slug immutability ----------------------------------------------------------
CREATE OR REPLACE FUNCTION gym_prevent_module_slug_update()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
BEGIN
  IF NEW.slug IS DISTINCT FROM OLD.slug THEN
    RAISE EXCEPTION 'modules.slug is immutable (attempted % -> %)', OLD.slug, NEW.slug;
  END IF;
  RETURN NEW;
END;
$fn$;
--> statement-breakpoint
DROP TRIGGER IF EXISTS trg_prevent_module_slug_update ON "modules";
--> statement-breakpoint
CREATE TRIGGER trg_prevent_module_slug_update
  BEFORE UPDATE ON "modules"
  FOR EACH ROW EXECUTE FUNCTION gym_prevent_module_slug_update();
--> statement-breakpoint

SELECT gym_attach_updated_at('modules');
