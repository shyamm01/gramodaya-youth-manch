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

  // Fetch membership record from PostgreSQL database
  let membershipStatus: 'active' | 'pending' | 'suspended' = 'pending';
  let memberRole = 'MEMBER';
  let memberVillage = '';

  const db = getDb();
  if (db) {
    try {
      const memberRecord = await db.query.members.findFirst({
        where: or(
          eq(schema.members.supabaseUserId, user.id),
          user.email ? eq(schema.members.email, user.email) : undefined
        ),
      });

      if (memberRecord) {
        membershipStatus = memberRecord.status as any;
        memberRole = memberRecord.systemRole || memberRecord.role || 'MEMBER';
        memberVillage = memberRecord.address || '';
      } else {
        membershipStatus = (user.user_metadata?.status as any) || 'pending';
      }
    } catch (err) {
      console.warn('Membership status query note:', err);
      membershipStatus = (user.user_metadata?.status as any) || 'pending';
    }
  } else {
    membershipStatus = (user.user_metadata?.status as any) || 'pending';
  }

  const userAuthData = {
    id: user.id,
    email: user.email || null,
    provider: user.app_metadata?.provider || (user.identities && user.identities[0]?.provider) || 'email',
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at || null,
    membershipStatus,
    memberRole,
    memberVillage,
  };

  return (
    <div className="min-h-[85vh] bg-[#F8F9FA] dark:bg-[#0B0F17] transition-colors">
      <DashboardClient
        user={userAuthData}
        initialProfile={
          profile
            ? {
                id: profile.id,
                fullName: profile.full_name,
                avatarUrl: profile.avatar_url,
                createdAt: profile.created_at,
                updatedAt: profile.updated_at,
              }
            : {
                id: user.id,
                fullName: (user.user_metadata?.full_name || user.user_metadata?.name || null) as string | null,
                avatarUrl: (user.user_metadata?.avatar_url || user.user_metadata?.picture || null) as string | null,
                createdAt: user.created_at,
                updatedAt: user.created_at,
              }
        }
      />
    </div>
  );
}
