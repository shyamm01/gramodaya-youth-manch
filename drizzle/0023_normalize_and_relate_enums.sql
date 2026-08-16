-- Migration: 0023_normalize_and_relate_enums.sql
-- Enforce Enum relations and Foreign Keys to Profiles across all domain tables

DO $$ BEGIN
  -- 1. Ensure all custom enum types exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_scope') THEN
    CREATE TYPE "public"."role_scope" AS ENUM('GLOBAL', 'VILLAGE');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'system_role') THEN
    CREATE TYPE "public"."system_role" AS ENUM('SUPER_ADMIN', 'ADMIN', 'MEMBER');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_status') THEN
    CREATE TYPE "public"."member_status" AS ENUM('active', 'pending', 'suspended');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_role') THEN
    CREATE TYPE "public"."member_role" AS ENUM('MEMBER', 'ADMIN');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'complaint_category') THEN
    CREATE TYPE "public"."complaint_category" AS ENUM(
      'Water', 'Road', 'Electricity', 'Cleanliness', 'Environment', 
      'Education', 'Health', 'Sanitation', 'Animal-related', 'Social Issue', 
      'Government Service', 'Other'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'complaint_status') THEN
    CREATE TYPE "public"."complaint_status" AS ENUM('NEW', 'ACTION IN PROGRESS', 'RESOLVED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'social_work_status') THEN
    CREATE TYPE "public"."social_work_status" AS ENUM('pending', 'approved', 'published');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
    CREATE TYPE "public"."event_status" AS ENUM('DRAFT', 'PENDING', 'PUBLISHED', 'COMPLETED', 'CANCELLED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gallery_status') THEN
    CREATE TYPE "public"."gallery_status" AS ENUM('pending', 'published');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'public_info_status') THEN
    CREATE TYPE "public"."public_info_status" AS ENUM('pending', 'approved', 'rejected');
  END IF;
EXCEPTION WHEN OTHERS THEN null;
END $$;

-- 2. Bind Foreign Keys from domain entities to profiles
DO $$ BEGIN
  -- User Permissions
  ALTER TABLE IF EXISTS public.user_permissions DROP CONSTRAINT IF EXISTS user_permissions_user_id_profiles_id_fk;
  ALTER TABLE IF EXISTS public.user_permissions 
    ADD CONSTRAINT user_permissions_user_id_profiles_id_fk 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

  -- User Village Roles
  ALTER TABLE IF EXISTS public.user_village_roles DROP CONSTRAINT IF EXISTS user_village_roles_user_id_profiles_id_fk;
  ALTER TABLE IF EXISTS public.user_village_roles 
    ADD CONSTRAINT user_village_roles_user_id_profiles_id_fk 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

  -- Complaints
  ALTER TABLE IF EXISTS public.complaints DROP CONSTRAINT IF EXISTS complaints_user_id_profiles_id_fk;
  ALTER TABLE IF EXISTS public.complaints 
    ADD CONSTRAINT complaints_user_id_profiles_id_fk 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

  -- Social Works
  ALTER TABLE IF EXISTS public.social_works DROP CONSTRAINT IF EXISTS social_works_user_id_profiles_id_fk;
  ALTER TABLE IF EXISTS public.social_works 
    ADD CONSTRAINT social_works_user_id_profiles_id_fk 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN null;
END $$;
