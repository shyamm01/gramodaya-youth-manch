-- ============================================================================
-- 0031 · AUTH → PROFILE SYNC TRIGGER
-- ----------------------------------------------------------------------------
-- Creates public.profiles row when Supabase Auth creates an auth.users row.
--
-- This is the only surviving auth trigger. The earlier history had two —
-- on_auth_user_created writing to `members` and on_auth_user_profile_created
-- writing to `profiles` — and once `members` was dropped the first one made
-- every signup fail. 0028 removes it; this file is the single definition.
--
-- The function writes only columns that still exist after normalisation: the
-- village is resolved to a village_id rather than stored as loose place-name
-- strings, and no role/is_approved/pincode copies are written.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  raw_meta            jsonb;
  v_full_name         text;
  v_mobile            text;
  v_email             text;
  v_avatar            text;
  v_status            public.member_status;
  v_system_role       public.system_role;
  v_status_str        text;
  v_role_str          text;
  v_village_id        bigint;
BEGIN
  raw_meta := COALESCE(new.raw_user_meta_data, '{}'::jsonb);

  v_full_name := NULLIF(btrim(COALESCE(
    raw_meta->>'full_name',
    raw_meta->>'name',
    raw_meta->>'user_name',
    split_part(COALESCE(new.email, ''), '@', 1)
  )), '');
  v_full_name := COALESCE(v_full_name, 'सदस्य');

  -- Stored as digits-only NULL-when-absent, matching the partial unique index
  -- on profiles.mobile.
  v_mobile := NULLIF(regexp_replace(COALESCE(raw_meta->>'mobile', new.phone, ''), '\D', '', 'g'), '');
  v_email  := NULLIF(btrim(COALESCE(new.email, raw_meta->>'email', '')), '');
  v_avatar := NULLIF(btrim(COALESCE(
    raw_meta->>'avatar_url', raw_meta->>'photo_url', raw_meta->>'picture', ''
  )), '');

  v_status_str := COALESCE(raw_meta->>'status', 'pending');
  v_status := CASE WHEN v_status_str IN ('active', 'pending', 'suspended')
                   THEN v_status_str::public.member_status
                   ELSE 'pending'::public.member_status END;

  v_role_str := COALESCE(raw_meta->>'system_role', raw_meta->>'role', 'MEMBER');
  v_system_role := CASE WHEN v_role_str IN ('SUPER_ADMIN', 'ADMIN', 'MEMBER')
                        THEN v_role_str::public.system_role
                        ELSE 'MEMBER'::public.system_role END;

  -- Resolve the village to its id. Anything the signup form knows about the
  -- place (name, panchayat, district, pincode) is reachable from here on, so
  -- none of it is copied onto the profile row.
  IF raw_meta ? 'village_id' AND (raw_meta->>'village_id') ~ '^\d+$' THEN
    SELECT id INTO v_village_id FROM public.villages WHERE id = (raw_meta->>'village_id')::bigint;
  END IF;

  IF v_village_id IS NULL AND NULLIF(btrim(COALESCE(raw_meta->>'village', raw_meta->>'villageName', '')), '') IS NOT NULL THEN
    SELECT id INTO v_village_id
      FROM public.villages
     WHERE slug = lower(btrim(COALESCE(raw_meta->>'village', raw_meta->>'villageName')))
        OR name  ILIKE btrim(COALESCE(raw_meta->>'village', raw_meta->>'villageName'))
        OR name_hindi = btrim(COALESCE(raw_meta->>'village', raw_meta->>'villageName'))
     ORDER BY id ASC
     LIMIT 1;
  END IF;

  IF v_village_id IS NULL THEN
    SELECT id INTO v_village_id
      FROM public.villages WHERE is_active = true ORDER BY id ASC LIMIT 1;
  END IF;

  INSERT INTO public.profiles (
    id, full_name, avatar_url, mobile, email,
    father_name, dob, gender, village_id, house_no, street,
    status, system_role, created_at, updated_at
  ) VALUES (
    new.id, v_full_name, v_avatar, v_mobile, v_email,
    NULLIF(btrim(COALESCE(raw_meta->>'father_name', raw_meta->>'fatherName', '')), ''),
    NULLIF(btrim(COALESCE(raw_meta->>'dob', '')), ''),
    NULLIF(btrim(COALESCE(raw_meta->>'gender', '')), ''),
    v_village_id,
    NULLIF(btrim(COALESCE(raw_meta->>'house_no', raw_meta->>'houseNo', '')), ''),
    NULLIF(btrim(COALESCE(raw_meta->>'street', '')), ''),
    v_status, v_system_role, now(), now()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name   = COALESCE(NULLIF(EXCLUDED.full_name, 'सदस्य'), public.profiles.full_name),
    avatar_url  = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    mobile      = COALESCE(EXCLUDED.mobile, public.profiles.mobile),
    email       = COALESCE(EXCLUDED.email, public.profiles.email),
    father_name = COALESCE(EXCLUDED.father_name, public.profiles.father_name),
    dob         = COALESCE(EXCLUDED.dob, public.profiles.dob),
    gender      = COALESCE(EXCLUDED.gender, public.profiles.gender),
    village_id  = COALESCE(EXCLUDED.village_id, public.profiles.village_id),
    house_no    = COALESCE(EXCLUDED.house_no, public.profiles.house_no),
    street      = COALESCE(EXCLUDED.street, public.profiles.street),
    updated_at  = now();

  RETURN new;
END;
$fn$;
--> statement-breakpoint

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
              WHERE table_schema = 'auth' AND table_name = 'users') THEN
    DROP TRIGGER IF EXISTS on_auth_user_profile_created ON auth.users;
    CREATE TRIGGER on_auth_user_profile_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user_profile();
  END IF;
END $$;
