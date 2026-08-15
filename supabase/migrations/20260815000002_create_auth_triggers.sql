-- Supabase Platform Extension: Auth Sync Trigger
-- Automatically syncs Supabase Auth user creations with the members table

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.members (
    supabase_user_id,
    name,
    mobile,
    email,
    status,
    role,
    system_role,
    created_at,
    updated_at
  ) VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'नया सदस्य'),
    COALESCE(new.raw_user_meta_data->>'mobile', new.phone, ''),
    new.email,
    'active',
    'MEMBER',
    'MEMBER',
    NOW(),
    NOW()
  )
  ON CONFLICT (mobile) DO UPDATE
  SET 
    supabase_user_id = new.id,
    email = COALESCE(public.members.email, new.email),
    updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users if auth schema is accessible
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user();
  END IF;
EXCEPTION WHEN undefined_table THEN null;
END $$;
