-- Migration: Extend profiles table with membership metadata and update auth triggers
-- Unified Supabase Profiles Architecture

-- 1. Add all membership columns to public.profiles if they don't exist
DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photo_url text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mobile text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS father_name text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dob text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS village_id bigint;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS village_name text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gram_panchayat text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS district text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pincode text DEFAULT '241125';
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS house_no text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS street text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS occupation text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS designation text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS political_background text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS blood_group text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'MEMBER';
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS system_role text NOT NULL DEFAULT 'MEMBER';
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false;
EXCEPTION WHEN OTHERS THEN null;
END $$;

-- 2. Add indexes for high-performance directory and authentication lookups
CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON public.profiles (mobile);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles (status);
CREATE INDEX IF NOT EXISTS idx_profiles_system_role ON public.profiles (system_role);
CREATE INDEX IF NOT EXISTS idx_profiles_village_id ON public.profiles (village_id);

-- 3. Update the Automatic Profile Creation Trigger function
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
  extracted_village text;
  extracted_panchayat text;
  extracted_district text;
  extracted_state text;
  extracted_pincode text;
  extracted_address text;
  extracted_role text;
  extracted_status text;
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
  extracted_village := COALESCE(raw_meta->>'village', raw_meta->>'villageName', 'Rasoolpur');
  extracted_panchayat := COALESCE(raw_meta->>'gram_panchayat', raw_meta->>'gramPanchayat', 'Bahera');
  extracted_district := COALESCE(raw_meta->>'district', 'Hardoi');
  extracted_state := COALESCE(raw_meta->>'state', 'Uttar Pradesh');
  extracted_pincode := COALESCE(raw_meta->>'pincode', '241125');
  extracted_address := COALESCE(raw_meta->>'address', extracted_village || ', ' || extracted_panchayat);
  extracted_role := COALESCE(raw_meta->>'system_role', raw_meta->>'role', 'MEMBER');
  extracted_status := COALESCE(raw_meta->>'status', 'pending');

  INSERT INTO public.profiles (
    id,
    full_name,
    avatar_url,
    photo_url,
    mobile,
    email,
    father_name,
    dob,
    gender,
    village_name,
    gram_panchayat,
    district,
    state,
    pincode,
    address,
    status,
    role,
    system_role,
    is_approved,
    created_at,
    updated_at
  ) VALUES (
    new.id,
    extracted_name,
    COALESCE(raw_meta->>'avatar_url', raw_meta->>'picture', ''),
    COALESCE(raw_meta->>'photo_url', raw_meta->>'avatar_url', ''),
    extracted_mobile,
    extracted_email,
    extracted_father,
    extracted_dob,
    extracted_gender,
    extracted_village,
    extracted_panchayat,
    extracted_district,
    extracted_state,
    extracted_pincode,
    extracted_address,
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
    village_name = CASE WHEN EXCLUDED.village_name IS NOT NULL AND EXCLUDED.village_name <> '' THEN EXCLUDED.village_name ELSE public.profiles.village_name END,
    gram_panchayat = CASE WHEN EXCLUDED.gram_panchayat IS NOT NULL AND EXCLUDED.gram_panchayat <> '' THEN EXCLUDED.gram_panchayat ELSE public.profiles.gram_panchayat END,
    district = CASE WHEN EXCLUDED.district IS NOT NULL AND EXCLUDED.district <> '' THEN EXCLUDED.district ELSE public.profiles.district END,
    state = CASE WHEN EXCLUDED.state IS NOT NULL AND EXCLUDED.state <> '' THEN EXCLUDED.state ELSE public.profiles.state END,
    pincode = CASE WHEN EXCLUDED.pincode IS NOT NULL AND EXCLUDED.pincode <> '' THEN EXCLUDED.pincode ELSE public.profiles.pincode END,
    address = CASE WHEN EXCLUDED.address IS NOT NULL AND EXCLUDED.address <> '' THEN EXCLUDED.address ELSE public.profiles.address END,
    updated_at = NOW();

  RETURN new;
END;
$$;

-- 4. Re-create trigger on auth.users
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    DROP TRIGGER IF EXISTS on_auth_user_profile_created ON auth.users;
    CREATE TRIGGER on_auth_user_profile_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user_profile();
  END IF;
END $$;

-- 5. RLS Policies: Public and Authenticated Access
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active member profiles for directory, and own profile even if pending
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can view active profiles" ON public.profiles;
  CREATE POLICY "Public can view active profiles"
    ON public.profiles
    FOR SELECT
    USING (
      status = 'active' 
      OR (auth.uid() IS NOT NULL AND (SELECT auth.uid()) = id)
      OR system_role IN ('ADMIN', 'SUPER_ADMIN')
    );
EXCEPTION WHEN OTHERS THEN null;
END $$;
