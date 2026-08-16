import { NextResponse } from 'next/server';
import { extractTokenFromRequest, verifyJwtToken } from '@/src/lib/jwtAuth';
import { getSqlClient } from '@/src/lib/authUtils';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { ROLE_DEFAULT_PERMISSIONS } from '@/src/lib/permissions';

export async function GET(req: Request) {
  try {
    let token = extractTokenFromRequest(req);
    let payload: any = null;
    let supabaseUser: any = null;

    // 1. Try custom JWT token if present
    if (token) {
      payload = await verifyJwtToken(token);
    }

    // 2. If no JWT payload, check Supabase Server Client (SSR cookies)
    if (!payload) {
      try {
        const supabase = await createServerSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          supabaseUser = user;
          const meta = user.user_metadata || {};
          const appMeta = user.app_metadata || {};
          const role = appMeta.role || meta.role || 'MEMBER';
          payload = {
            sub: user.id,
            id: user.id,
            name: meta.full_name || user.email,
            mobile: meta.mobile || user.phone || '',
            email: user.email || '',
            role,
            systemRole: role,
            villageId: meta.villageId || '8',
            isAdmin: role === 'SUPER_ADMIN' || role === 'ADMIN',
          };
        }
      } catch (e) {
        // Continue
      }
    }

    if (!payload && !supabaseUser) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    // 3. Look up database profile record from public.profiles
    const sql = getSqlClient();
    let profileRecord: any = null;
    let customPermissions: string[] = [];

    const targetUserId = supabaseUser?.id || payload?.sub || payload?.id;

    if (sql && targetUserId) {
      try {
        // Query by profile UUID
        const rows = await sql`
          SELECT p.*, v.name AS village_name, v.name_hindi AS village_name_hindi, v.org_name, v.org_name_hindi
          FROM public.profiles p
          LEFT JOIN public.villages v ON p.village_id = v.id
          WHERE p.id = ${targetUserId}::uuid
          LIMIT 1
        `;
        if (rows && rows.length > 0) {
          profileRecord = rows[0];
        }

        // Query by email fallback
        if (!profileRecord && payload?.email) {
          const emailRows = await sql`
            SELECT p.*, v.name AS village_name, v.name_hindi AS village_name_hindi, v.org_name, v.org_name_hindi
            FROM public.profiles p
            LEFT JOIN public.villages v ON p.village_id = v.id
            WHERE p.email ILIKE ${payload.email}
            LIMIT 1
          `;
          if (emailRows && emailRows.length > 0) {
            profileRecord = emailRows[0];
          }
        }

        // Query by mobile fallback
        if (!profileRecord && payload?.mobile) {
          const cleanDigits = payload.mobile.replace(/\D/g, '').slice(-10);
          if (cleanDigits.length >= 10) {
            const mobRows = await sql`
              SELECT p.*, v.name AS village_name, v.name_hindi AS village_name_hindi, v.org_name, v.org_name_hindi
              FROM public.profiles p
              LEFT JOIN public.villages v ON p.village_id = v.id
              WHERE REGEXP_REPLACE(p.mobile, '\\D', '', 'g') LIKE ${'%' + cleanDigits}
              LIMIT 1
            `;
            if (mobRows && mobRows.length > 0) {
              profileRecord = mobRows[0];
            }
          }
        }

        // Query custom permissions from public.user_permissions
        if (profileRecord?.id) {
          const permRows = await sql`
            SELECT permission_code 
            FROM public.user_permissions
            WHERE user_id = ${profileRecord.id} AND is_granted = true
          `;
          if (permRows && permRows.length > 0) {
            customPermissions = permRows.map((r: any) => r.permission_code);
          }
        }
      } catch (dbErr) {
        console.warn('DB profile lookup note in /api/auth/me:', dbErr);
      }
    }

    // 4. Resolve RBAC role & permissions
    const rawSystemRole = profileRecord?.system_role || payload?.systemRole || 'MEMBER';
    const isSuper =
      rawSystemRole === 'SUPER_ADMIN' ||
      payload?.isSuperAdmin;
    const effectiveSystemRole: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER' = isSuper ? 'SUPER_ADMIN' : rawSystemRole === 'ADMIN' ? 'ADMIN' : 'MEMBER';
    const effectiveRole: 'ADMIN' | 'MEMBER' = (effectiveSystemRole === 'SUPER_ADMIN' || effectiveSystemRole === 'ADMIN' || profileRecord?.role === 'ADMIN') ? 'ADMIN' : 'MEMBER';
    const isAdm = effectiveSystemRole === 'SUPER_ADMIN' || effectiveSystemRole === 'ADMIN';

    const roleDefaultPerms = ROLE_DEFAULT_PERMISSIONS[effectiveSystemRole] || [];
    const allPermissions = Array.from(new Set([...roleDefaultPerms, ...customPermissions, ...(payload?.permissions || [])]));

    const user = {
      id: String(profileRecord?.id || targetUserId || payload?.id || payload?.sub),
      supabaseUserId: supabaseUser?.id || targetUserId || null,
      name: profileRecord?.full_name || payload?.name || 'Member',
      fullName: profileRecord?.full_name || payload?.name || 'Member',
      mobile: profileRecord?.mobile || payload?.mobile || '',
      email: profileRecord?.email || payload?.email || '',
      photoUrl: profileRecord?.avatar_url || payload?.photoUrl || '',
      avatarUrl: profileRecord?.avatar_url || payload?.photoUrl || '',
      status: profileRecord?.status || 'active',
      role: effectiveRole,
      systemRole: effectiveSystemRole,
      isAdmin: isAdm,
      isSuperAdmin: isSuper,
      villageId: profileRecord?.village_id ? String(profileRecord.village_id) : payload?.villageId || '8',
      organizationName: profileRecord?.org_name_hindi || profileRecord?.org_name || 'ग्रामोदय यूथ मंच',
      permissions: allPermissions,
    };

    return NextResponse.json({
      authenticated: true,
      user,
      token: token || null,
    });
  } catch (err: any) {
    console.error('Error verifying auth session in /api/auth/me:', err);
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}
