-- ============================================================================
-- 0033 · REPAIR auth.users METADATA
-- ----------------------------------------------------------------------------
-- Data repair, not a schema change. GoTrue (the Supabase Auth server) reads
-- auth.users.raw_app_meta_data and raw_user_meta_data into a Go models.JSONMap,
-- which only accepts a JSON *object*. Two rows held a JSON *array*, so every
-- sign-in died inside the auth server before it ever reached this application:
--
--   GET /?error=server_error&error_description=
--     sql: Scan error on column index 26, name "raw_app_meta_data":
--     json: cannot unmarshal array into Go value of type models.JSONMap
--
-- The stored value looked like:
--
--   [{"provider":"google","providers":["google"]},
--    "{\"role\":\"SUPER_ADMIN\"}",
--    {"role":"SUPER_ADMIN"}]
--
-- which is the signature of `jsonb || jsonb` where the right-hand side was a
-- JSON string rather than an object. In PostgreSQL, object || non-object does
-- not merge — it builds an array:
--
--   '{"a":1}'::jsonb || '"x"'::jsonb   =>  [{"a":1}, "x"]
--
-- So a hand-run "grant myself admin" statement in the SQL editor, with the role
-- payload double-encoded as a string, silently converted the object into an
-- array and locked everyone out of login. Application code only ever reads this
-- metadata (never writes it), so the corruption cannot recur from the app.
--
-- The repair folds the array back into one object, merging every element in
-- order, so nothing is lost — including the role that was being granted.
-- Guarded and idempotent: rows already holding an object are untouched, and the
-- whole file is a no-op where the `auth` schema does not exist (plain
-- PostgreSQL, local dev without Supabase).
-- ============================================================================

CREATE OR REPLACE FUNCTION gym_fold_jsonb_to_object(p jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $fn$
DECLARE
  result jsonb := '{}'::jsonb;
  elem   jsonb;
  parsed jsonb;
BEGIN
  IF p IS NULL THEN
    RETURN '{}'::jsonb;
  END IF;

  IF jsonb_typeof(p) = 'object' THEN
    RETURN p;
  END IF;

  IF jsonb_typeof(p) = 'array' THEN
    FOR elem IN SELECT * FROM jsonb_array_elements(p) LOOP
      IF jsonb_typeof(elem) = 'object' THEN
        -- Later elements win on key collisions, matching the order the
        -- accidental concatenations were applied.
        result := result || elem;
      ELSIF jsonb_typeof(elem) = 'string' THEN
        -- A double-encoded object, e.g. "{\"role\":\"ADMIN\"}".
        BEGIN
          parsed := (elem #>> '{}')::jsonb;
          IF jsonb_typeof(parsed) = 'object' THEN
            result := result || parsed;
          END IF;
        EXCEPTION WHEN others THEN
          NULL; -- not JSON; drop it rather than fail the migration
        END;
      END IF;
    END LOOP;
    RETURN result;
  END IF;

  IF jsonb_typeof(p) = 'string' THEN
    BEGIN
      parsed := (p #>> '{}')::jsonb;
      IF jsonb_typeof(parsed) = 'object' THEN
        RETURN parsed;
      END IF;
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END IF;

  RETURN '{}'::jsonb;
END;
$fn$;
--> statement-breakpoint

DO $$
DECLARE
  v_app  integer := 0;
  v_user integer := 0;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    RAISE NOTICE 'auth.users not present — skipping metadata repair';
    RETURN;
  END IF;

  UPDATE auth.users
     SET raw_app_meta_data = gym_fold_jsonb_to_object(raw_app_meta_data)
   WHERE raw_app_meta_data IS NOT NULL
     AND jsonb_typeof(raw_app_meta_data) <> 'object';
  GET DIAGNOSTICS v_app = ROW_COUNT;

  UPDATE auth.users
     SET raw_user_meta_data = gym_fold_jsonb_to_object(raw_user_meta_data)
   WHERE raw_user_meta_data IS NOT NULL
     AND jsonb_typeof(raw_user_meta_data) <> 'object';
  GET DIAGNOSTICS v_user = ROW_COUNT;

  -- Restore provider / providers from auth.identities for any row that lost
  -- them. The fold preserves them when they were in the array, so this only
  -- fires if the original object was destroyed outright.
  UPDATE auth.users u
     SET raw_app_meta_data = COALESCE(u.raw_app_meta_data, '{}'::jsonb)
         || jsonb_build_object('provider', i.first_provider, 'providers', i.all_providers)
    FROM (
      SELECT user_id,
             (array_agg(provider ORDER BY created_at))[1] AS first_provider,
             jsonb_agg(DISTINCT provider)                 AS all_providers
        FROM auth.identities
       GROUP BY user_id
    ) i
   WHERE i.user_id = u.id
     AND (u.raw_app_meta_data IS NULL
          OR u.raw_app_meta_data->>'provider' IS NULL
          OR u.raw_app_meta_data->'providers' IS NULL);

  RAISE NOTICE 'auth metadata repair: % app_meta row(s), % user_meta row(s)', v_app, v_user;
END $$;
--> statement-breakpoint

-- Belt and braces: NULL is also not an object as far as GoTrue's scan is
-- concerned on some versions.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
              WHERE table_schema = 'auth' AND table_name = 'users') THEN
    UPDATE auth.users SET raw_app_meta_data  = '{}'::jsonb WHERE raw_app_meta_data  IS NULL;
    UPDATE auth.users SET raw_user_meta_data = '{}'::jsonb WHERE raw_user_meta_data IS NULL;
  END IF;
END $$;
