import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { eq, or } from 'drizzle-orm';
import { DashboardClient } from './DashboardClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'डैशबोर्ड | सदस्य प्रोफाइल (Dashboard)',
  description: 'ग्रामोदय यूथ मंच सदस्य डैशबोर्ड एवं प्रोफाइल प्रबंधन',
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Verify server-side authentication (PRD Section 22)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login?next=/dashboard');
  }

  // Fetch application profile from public.profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch membership record directly from unified profiles
  const membershipStatus: 'active' | 'pending' | 'suspended' =
    (profile?.status as any) || (user.user_metadata?.status as any) || 'pending';
  const rawSystemRole = profile?.system_role || user.user_metadata?.system_role || 'MEMBER';
  const isSuper = rawSystemRole === 'SUPER_ADMIN' || user.email === 'shyamvaranpal95060@gmail.com';
  const systemRole: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER' = isSuper ? 'SUPER_ADMIN' : rawSystemRole === 'ADMIN' ? 'ADMIN' : 'MEMBER';
  const role: 'ADMIN' | 'MEMBER' = (systemRole === 'SUPER_ADMIN' || systemRole === 'ADMIN' || profile?.role === 'ADMIN') ? 'ADMIN' : 'MEMBER';
  const memberVillage = profile?.village_name || profile?.address || '';

  const userAuthData = {
    id: user.id,
    email: user.email || null,
    provider: user.app_metadata?.provider || (user.identities && user.identities[0]?.provider) || 'email',
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at || null,
    membershipStatus,
    memberRole: role,
    systemRole,
    role,
    memberVillage,
  };

  // Fetch villages list
  const { data: villagesList } = await supabase
    .from('villages')
    .select('id, name, name_hindi, slug')
    .order('name');

  return (
    <div className="min-h-[85vh] bg-[#F8F9FA] dark:bg-[#0B0F17] transition-colors">
      <DashboardClient
        user={userAuthData}
        villages={villagesList || []}
        initialProfile={
          profile
            ? {
                id: profile.id,
                fullName: profile.full_name,
                avatarUrl: profile.avatar_url,
                mobile: profile.mobile,
                email: profile.email,
                fatherName: profile.father_name,
                dob: profile.dob,
                gender: profile.gender,
                villageId: profile.village_id ? String(profile.village_id) : '',
                houseNo: profile.house_no,
                street: profile.street,
                pincode: profile.pincode,
                occupation: profile.occupation,
                designation: profile.designation,
                politicalBackground: profile.political_background,
                bloodGroup: profile.blood_group,
                systemRole,
                role,
                status: profile.status,
                createdAt: profile.created_at,
                updatedAt: profile.updated_at,
              }
            : {
                id: user.id,
                fullName: (user.user_metadata?.full_name || user.user_metadata?.name || null) as string | null,
                avatarUrl: (user.user_metadata?.avatar_url || user.user_metadata?.picture || null) as string | null,
                mobile: (user.user_metadata?.mobile || user.phone || null) as string | null,
                email: user.email || null,
                fatherName: null,
                dob: null,
                gender: null,
                villageId: '8',
                houseNo: null,
                street: null,
                pincode: null,
                occupation: null,
                designation: null,
                politicalBackground: null,
                bloodGroup: null,
                systemRole,
                role,
                status: membershipStatus,
                createdAt: user.created_at,
                updatedAt: user.created_at,
              }
        }
      />
    </div>
  );
}
