-- Create profiles table in public schema
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
DO $$ BEGIN
  CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = id)
    WITH CHECK ((SELECT auth.uid()) = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Automatic Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_auth_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    avatar_url,
    created_at,
    updated_at
  ) VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'user_name',
      split_part(COALESCE(new.email, ''), '@', 1)
    ),
    COALESCE(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture',
      ''
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = CASE 
      WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' 
      THEN EXCLUDED.full_name 
      ELSE public.profiles.full_name 
    END,
    avatar_url = CASE 
      WHEN public.profiles.avatar_url IS NULL OR public.profiles.avatar_url = '' 
      THEN EXCLUDED.avatar_url 
      ELSE public.profiles.avatar_url 
    END,
    updated_at = NOW();

  RETURN new;
END;
$$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    DROP TRIGGER IF EXISTS on_auth_user_profile_created ON auth.users;
    CREATE TRIGGER on_auth_user_profile_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user_profile();
  END IF;
EXCEPTION WHEN undefined_table THEN null;
END $$;
