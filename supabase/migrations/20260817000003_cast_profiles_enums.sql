-- Migration: Cast profiles columns (system_role, role, status) to PostgreSQL native Enum types
-- Enables dropdown selector options in Supabase Studio & database tools

DO $$ BEGIN
  -- 1. Alter system_role on profiles
  ALTER TABLE public.profiles ALTER COLUMN system_role DROP DEFAULT;
  ALTER TABLE public.profiles 
    ALTER COLUMN system_role TYPE public.system_role 
    USING (
      CASE 
        WHEN system_role IN ('SUPER_ADMIN', 'ADMIN', 'MEMBER') 
        THEN system_role::public.system_role 
        ELSE 'MEMBER'::public.system_role 
      END
    );
  ALTER TABLE public.profiles ALTER COLUMN system_role SET DEFAULT 'MEMBER'::public.system_role;

  -- 2. Alter role on profiles
  ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
  ALTER TABLE public.profiles 
    ALTER COLUMN role TYPE public.member_role 
    USING (
      CASE 
        WHEN role IN ('MEMBER', 'ADMIN') 
        THEN role::public.member_role 
        ELSE 'MEMBER'::public.member_role 
      END
    );
  ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'MEMBER'::public.member_role;

  -- 3. Alter status on profiles
  ALTER TABLE public.profiles ALTER COLUMN status DROP DEFAULT;
  ALTER TABLE public.profiles 
    ALTER COLUMN status TYPE public.member_status 
    USING (
      CASE 
        WHEN status IN ('active', 'pending', 'suspended') 
        THEN status::public.member_status 
        ELSE 'pending'::public.member_status 
      END
    );
  ALTER TABLE public.profiles ALTER COLUMN status SET DEFAULT 'pending'::public.member_status;

EXCEPTION WHEN OTHERS THEN 
  RAISE NOTICE 'Enum alter notice: %', SQLERRM;
END $$;

-- 4. Update the Auth Trigger function with enum casts
CREATE OR REPLACE FUNCTION public.handle_new_auth_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  raw_meta jsonb;
  extracted_name text;
  extracted_mobile text;
  extracted_email text;
  extracted_father text;
  extracted_dob text;
  extracted_gender text;
  extracted_house_no text;
  extracted_street text;
  extracted_pincode text;
  extracted_role_str text;
  extracted_status_str text;
  final_sys_role public.system_role;
  final_mem_role public.member_role;
  final_status public.member_status;
  resolved_village_id bigint;
BEGIN
  raw_meta := COALESCE(new.raw_user_meta_data, '{}'::jsonb);

  extracted_name := COALESCE(
    raw_meta->>'full_name',
    raw_meta->>'name',
    raw_meta->>'user_name',
    split_part(COALESCE(new.email, ''), '@', 1),
    'Member'
  );

  extracted_mobile := COALESCE(
    raw_meta->>'mobile',
    new.phone,
    ''
  );

  extracted_email := COALESCE(
    new.email,
    raw_meta->>'email',
    ''
  );

  extracted_father := COALESCE(raw_meta->>'father_name', raw_meta->>'fatherName', '');
  extracted_dob := COALESCE(raw_meta->>'dob', '');
  extracted_gender := COALESCE(raw_meta->>'gender', 'Male');
  extracted_house_no := COALESCE(raw_meta->>'house_no', raw_meta->>'houseNo', '');
  extracted_street := COALESCE(raw_meta->>'street', '');
  extracted_pincode := COALESCE(raw_meta->>'pincode', '241125');
  
  extracted_role_str := COALESCE(raw_meta->>'system_role', raw_meta->>'role', 'MEMBER');
  extracted_status_str := COALESCE(raw_meta->>'status', 'pending');

  -- Cast system_role enum
  IF extracted_role_str IN ('SUPER_ADMIN', 'DISTRICT_ADMIN', 'PANCHAYAT_ADMIN', 'VILLAGE_ADMIN', 'VILLAGE_MODERATOR', 'ADMIN', 'MEMBER', 'GUEST') THEN
    final_sys_role := extracted_role_str::public.system_role;
  ELSE
    final_sys_role := 'MEMBER'::public.system_role;
  END IF;

  -- Cast member_role enum
  IF extracted_role_str IN ('ADMIN', 'SUPER_ADMIN') THEN
    final_mem_role := 'ADMIN'::public.member_role;
  ELSE
    final_mem_role := 'MEMBER'::public.member_role;
  END IF;

  -- Cast member_status enum
  IF extracted_status_str IN ('active', 'pending', 'suspended') THEN
    final_status := extracted_status_str::public.member_status;
  ELSE
    final_status := 'pending'::public.member_status;
  END IF;

  -- Resolve normalized village_id from database
  IF raw_meta ? 'village_id' AND raw_meta->>'village_id' IS NOT NULL AND (raw_meta->>'village_id') ~ '^\d+$' THEN
    resolved_village_id := (raw_meta->>'village_id')::bigint;
  ELSE
    SELECT id INTO resolved_village_id 
    FROM public.villages 
    WHERE slug = 'rasoolpur' OR name ILIKE '%rasoolpur%' OR is_active = true
    ORDER BY id ASC LIMIT 1;
  END IF;

  INSERT INTO public.profiles (
    id,
    full_name,
    avatar_url,
    mobile,
    email,
    father_name,
    dob,
    gender,
    village_id,
    house_no,
    street,
    pincode,
    status,
    role,
    system_role,
    is_approved,
    created_at,
    updated_at
  ) VALUES (
    new.id,
    extracted_name,
    COALESCE(raw_meta->>'avatar_url', raw_meta->>'photo_url', raw_meta->>'picture', ''),
    extracted_mobile,
    extracted_email,
    extracted_father,
    extracted_dob,
    extracted_gender,
    resolved_village_id,
    extracted_house_no,
    extracted_street,
    extracted_pincode,
    final_status,
    final_mem_role,
    final_sys_role,
    CASE WHEN final_status = 'active' THEN true ELSE false END,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = CASE WHEN EXCLUDED.full_name IS NOT NULL AND EXCLUDED.full_name <> '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
    mobile = CASE WHEN EXCLUDED.mobile IS NOT NULL AND EXCLUDED.mobile <> '' THEN EXCLUDED.mobile ELSE public.profiles.mobile END,
    email = CASE WHEN EXCLUDED.email IS NOT NULL AND EXCLUDED.email <> '' THEN EXCLUDED.email ELSE public.profiles.email END,
    father_name = CASE WHEN EXCLUDED.father_name IS NOT NULL AND EXCLUDED.father_name <> '' THEN EXCLUDED.father_name ELSE public.profiles.father_name END,
    dob = CASE WHEN EXCLUDED.dob IS NOT NULL AND EXCLUDED.dob <> '' THEN EXCLUDED.dob ELSE public.profiles.dob END,
    gender = CASE WHEN EXCLUDED.gender IS NOT NULL AND EXCLUDED.gender <> '' THEN EXCLUDED.gender ELSE public.profiles.gender END,
    village_id = COALESCE(EXCLUDED.village_id, public.profiles.village_id),
    pincode = CASE WHEN EXCLUDED.pincode IS NOT NULL AND EXCLUDED.pincode <> '' THEN EXCLUDED.pincode ELSE public.profiles.pincode END,
    house_no = CASE WHEN EXCLUDED.house_no IS NOT NULL AND EXCLUDED.house_no <> '' THEN EXCLUDED.house_no ELSE public.profiles.house_no END,
    street = CASE WHEN EXCLUDED.street IS NOT NULL AND EXCLUDED.street <> '' THEN EXCLUDED.street ELSE public.profiles.street END,
    updated_at = NOW();

  RETURN new;
END;
$$;
