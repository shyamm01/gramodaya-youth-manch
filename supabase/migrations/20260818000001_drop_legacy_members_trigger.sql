-- Migration: Drop legacy auth trigger left over after removing public.members
-- public.members was dropped in 20260817000001_drop_legacy_members_table.sql,
-- but the on_auth_user_created trigger (which inserts into it) was never removed.
-- Every new auth.users insert now fails with "Database error saving new user"
-- because the trigger's target table no longer exists. Profile creation is
-- already fully handled by on_auth_user_profile_created -> public.profiles.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_auth_user();
