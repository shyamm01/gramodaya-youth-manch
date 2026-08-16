-- Migration: Normalize profiles table address fields and optimize schema
-- 3NF Normalized Architecture: Profiles reference villages(id) directly

DO $$ BEGIN
  -- Ensure foreign key from profiles to villages exists
  ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_village_id_villages_id_fk;
  ALTER TABLE IF EXISTS public.profiles 
    ADD CONSTRAINT profiles_village_id_villages_id_fk 
    FOREIGN KEY (village_id) REFERENCES public.villages(id) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN null;
END $$;

-- Drop redundant duplicate string columns from profiles (derived via village_id relation)
DO $$ BEGIN
  ALTER TABLE public.profiles DROP COLUMN IF EXISTS photo_url;
  ALTER TABLE public.profiles DROP COLUMN IF EXISTS address;
  ALTER TABLE public.profiles DROP COLUMN IF EXISTS village_name;
  ALTER TABLE public.profiles DROP COLUMN IF EXISTS gram_panchayat;
  ALTER TABLE public.profiles DROP COLUMN IF EXISTS district;
  ALTER TABLE public.profiles DROP COLUMN IF EXISTS state;
EXCEPTION WHEN OTHERS THEN null;
END $$;

-- Update the Automatic Profile Creation Trigger function to resolve village_id dynamically
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
  extracted_role text;
  extracted_status text;
  resolved_village_id bigint;
BEGIN
  raw_meta := COALESCE(new.raw_user_meta_data, '{}'::jsonb);

  extracted_name := COALESCE(
    raw_meta->>'full_name',
    raw_meta->>'name',
    raw_meta->>'user_name',
    split_part(COALESCE(new.email, ''), '@', 1)
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
  extracted_role := COALESCE(raw_meta->>'system_role', raw_meta->>'role', 'MEMBER');
  extracted_status := COALESCE(raw_meta->>'status', 'pending');

  -- Resolve normalized village_id from database
  IF raw_meta ? 'village_id' AND raw_meta->>'village_id' IS NOT NULL AND (raw_meta->>'village_id') ~ '^\d+$' THEN
    resolved_village_id := (raw_meta->>'village_id')::bigint;
  ELSE
    -- Match by village slug or default to active village
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
    extracted_status,
    extracted_role,
    extracted_role,
    CASE WHEN extracted_status = 'active' THEN true ELSE false END,
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
