-- ============================================================================
-- 0000 · EXTENSIONS & MIGRATION HELPERS
-- ----------------------------------------------------------------------------
-- Runs first. Installs the extensions every later migration assumes, plus the
-- small set of helper routines the per-table migrations use to stay
-- CONVERGENT: each table file must produce the same final shape whether it is
-- applied to an empty database or to one that already carries earlier drift.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
--> statement-breakpoint

-- ----------------------------------------------------------------------------
-- gym_sync_enum(type_name, labels)
-- ----------------------------------------------------------------------------
-- Brings an enum type to exactly the label set given, without ever using
-- `ALTER TYPE ... ADD VALUE` (which cannot be used and then referenced inside
-- the same transaction — and every Drizzle migration file runs in one).
--
-- Strategy:
--   * type missing            -> CREATE TYPE
--   * labels already a superset -> no-op
--   * otherwise               -> build a replacement type, re-point every
--                                dependent column at it (preserving defaults
--                                and NOT NULL), then drop the old type.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION gym_sync_enum(p_type text, p_labels text[])
RETURNS void
LANGUAGE plpgsql
AS $fn$
DECLARE
  v_existing text[];
  v_missing  text[];
  v_col      record;
  v_default  text;
BEGIN
  SELECT array_agg(e.enumlabel::text ORDER BY e.enumsortorder)
    INTO v_existing
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    JOIN pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typname = p_type;

  IF v_existing IS NULL THEN
    EXECUTE format(
      'CREATE TYPE public.%I AS ENUM (%s)',
      p_type,
      (SELECT string_agg(quote_literal(l), ', ') FROM unnest(p_labels) AS l)
    );
    RETURN;
  END IF;

  SELECT array_agg(l) INTO v_missing
    FROM unnest(p_labels) AS l
   WHERE l <> ALL (v_existing);

  -- Existing type already carries every label we need. Extra legacy labels are
  -- left alone here; 0028 prunes the types that become entirely unused.
  IF v_missing IS NULL AND v_existing @> p_labels THEN
    RETURN;
  END IF;

  EXECUTE format('ALTER TYPE public.%I RENAME TO %I', p_type, p_type || '__gym_old');

  EXECUTE format(
    'CREATE TYPE public.%I AS ENUM (%s)',
    p_type,
    (SELECT string_agg(quote_literal(l), ', ') FROM unnest(p_labels) AS l)
  );

  FOR v_col IN
    SELECT c.relname AS table_name, a.attname AS column_name
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_type t ON t.oid = a.atttypid
     WHERE n.nspname = 'public'
       AND c.relkind = 'r'
       AND a.attnum > 0
       AND NOT a.attisdropped
       AND t.typname = p_type || '__gym_old'
  LOOP
    SELECT pg_get_expr(d.adbin, d.adrelid)
      INTO v_default
      FROM pg_attrdef d
      JOIN pg_class c ON c.oid = d.adrelid
      JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.adnum
     WHERE c.relname = v_col.table_name AND a.attname = v_col.column_name;

    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I DROP DEFAULT',
                   v_col.table_name, v_col.column_name);

    EXECUTE format(
      'ALTER TABLE public.%I ALTER COLUMN %I TYPE public.%I USING (%I::text::public.%I)',
      v_col.table_name, v_col.column_name, p_type, v_col.column_name, p_type
    );

    IF v_default IS NOT NULL THEN
      -- Re-stamp the default against the new type name.
      EXECUTE format(
        'ALTER TABLE public.%I ALTER COLUMN %I SET DEFAULT %s',
        v_col.table_name, v_col.column_name,
        regexp_replace(v_default, p_type || '__gym_old', p_type, 'g')
      );
    END IF;
  END LOOP;

  EXECUTE format('DROP TYPE public.%I', p_type || '__gym_old');
END;
$fn$;
--> statement-breakpoint

-- ----------------------------------------------------------------------------
-- gym_cast_column_to_enum(table, column, type, fallback)
-- ----------------------------------------------------------------------------
-- Converts a text column that should have been an enum all along. Rows holding
-- a value outside the enum are rewritten to `fallback` first, so the cast can
-- never fail mid-migration and leave the table half-converted.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION gym_cast_column_to_enum(
  p_table text, p_column text, p_type text, p_fallback text
)
RETURNS void
LANGUAGE plpgsql
AS $fn$
DECLARE
  v_udt text;
BEGIN
  SELECT udt_name INTO v_udt
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = p_table AND column_name = p_column;

  IF v_udt IS NULL OR v_udt = p_type THEN
    RETURN; -- column absent, or already the right type
  END IF;

  EXECUTE format(
    'UPDATE public.%I SET %I = %L WHERE %I IS NOT NULL AND %I::text NOT IN (SELECT e.enumlabel::text FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = %L)',
    p_table, p_column, p_fallback, p_column, p_column, p_type
  );

  EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I DROP DEFAULT', p_table, p_column);
  EXECUTE format(
    'ALTER TABLE public.%I ALTER COLUMN %I TYPE public.%I USING (COALESCE(%I::text, %L)::public.%I)',
    p_table, p_column, p_type, p_column, p_fallback, p_type
  );
  EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I SET DEFAULT %L::public.%I',
                 p_table, p_column, p_fallback, p_type);
  EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I SET NOT NULL', p_table, p_column);
END;
$fn$;
--> statement-breakpoint

-- ----------------------------------------------------------------------------
-- gym_drop_foreign_keys(table, column)
-- ----------------------------------------------------------------------------
-- Drops every FK constraint on (table, column). The per-table files call this
-- before re-adding the one canonical constraint, which is how the duplicated
-- `<table>_<col>_fkey` / `<table>_<col>_<ref>_id_fk` pairs left behind by the
-- two competing migration histories get collapsed to a single definition.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION gym_drop_foreign_keys(p_table text, p_column text)
RETURNS void
LANGUAGE plpgsql
AS $fn$
DECLARE
  v_con text;
BEGIN
  FOR v_con IN
    SELECT tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON kcu.constraint_name = tc.constraint_name
       AND kcu.table_schema = tc.table_schema
     WHERE tc.constraint_type = 'FOREIGN KEY'
       AND tc.table_schema = 'public'
       AND tc.table_name = p_table
       AND kcu.column_name = p_column
  LOOP
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', p_table, v_con);
  END LOOP;
END;
$fn$;
--> statement-breakpoint

-- ----------------------------------------------------------------------------
-- gym_set_updated_at() — shared BEFORE UPDATE trigger body.
-- Every table carrying an updated_at column gets this attached in its own file,
-- so "updated_at is maintained by the database" is true uniformly instead of
-- depending on each API route remembering to set it.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION gym_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$fn$;
--> statement-breakpoint

-- ----------------------------------------------------------------------------
-- gym_attach_updated_at(table) — idempotently attaches the trigger above.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION gym_attach_updated_at(p_table text)
RETURNS void
LANGUAGE plpgsql
AS $fn$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = p_table AND column_name = 'updated_at'
  ) THEN
    RETURN;
  END IF;

  EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated_at ON public.%I', p_table, p_table);
  EXECUTE format(
    'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION gym_set_updated_at()',
    p_table, p_table
  );
END;
$fn$;
