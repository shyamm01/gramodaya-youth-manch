import { NextResponse } from 'next/server';
import { extractTokenFromRequest, verifyJwtToken } from '@/src/lib/jwtAuth';
import { getSqlClient } from '@/src/lib/authUtils';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { ROLE_DEFAULT_PERMISSIONS, isSuperAdmin } from '@/src/lib/permissions';

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
            name: meta.full_name || meta.name || user.email || 'Supabase User',
            mobile: meta.mobile || '',
            email: user.email || '',
            role,
            systemRole: role,
            villageId: meta.villageId || '1',
            isAdmin: role === 'SUPER_ADMIN' || role === 'ADMIN',
          };
        }
      } catch (e) {
        // Continue
      }
    }

    if (!payload) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    // 3. Look up database member record by ID, supabase_user_id, mobile, or email
    const sql = getSqlClient();
    let memberRecord: any = null;
    let customPermissions: string[] = [];

    if (sql) {
      try {
        // Query by supabase_user_id
        if (supabaseUser?.id) {
          const rows = await sql`SELECT * FROM public.members WHERE supabase_user_id = ${supabaseUser.id} LIMIT 1`;
          if (rows && rows.length > 0) memberRecord = rows[0];
        }

        // Query by numeric member id
        if (!memberRecord && payload.id && !isNaN(Number(payload.id))) {
          const rows = await sql`SELECT * FROM public.members WHERE id = ${Number(payload.id)} LIMIT 1`;
          if (rows && rows.length > 0) memberRecord = rows[0];
        }

        // Query by mobile
        if (!memberRecord && payload.mobile) {
          const cleanDigits = payload.mobile.replace(/\D/g, '').slice(-10);
          if (cleanDigits.length >= 10) {
            const rows = await sql`
              SELECT * FROM public.members 
              WHERE REGEXP_REPLACE(mobile, '\\D', '', 'g') LIKE ${'%' + cleanDigits}
              LIMIT 1
            `;
            if (rows && rows.length > 0) memberRecord = rows[0];
          }
        }

        // Query by email
        if (!memberRecord && payload.email) {
          const rows = await sql`SELECT * FROM public.members WHERE email = ${payload.email} LIMIT 1`;
          if (rows && rows.length > 0) memberRecord = rows[0];
        }

        // Query user_permissions if member exists
        if (memberRecord?.id) {
          const permRows = await sql`
            SELECT p.code 
            FROM public.user_permissions up
            JOIN public.permissions p ON up.permission_id = p.id
            WHERE up.member_id = ${memberRecord.id}
          `;
          if (permRows && permRows.length > 0) {
            customPermissions = permRows.map((r: any) => r.code);
          }
        }
      } catch (dbErr) {
        console.warn('DB member lookup fallback in /api/auth/me:', dbErr);
      }
    }

    // 4. Resolve RBAC role & permissions
    const rawRole = memberRecord?.system_role || payload.systemRole || payload.role || 'MEMBER';
    const isSuper =
      rawRole === 'SUPER_ADMIN' ||
      payload.isSuperAdmin ||
      payload.email === 'admin@gramodayarasoolpur.org' ||
      memberRecord?.mobile === '9506072678';
    const isAdm = isSuper || rawRole === 'ADMIN' || payload.isAdmin || memberRecord?.role === 'ADMIN';

    const effectiveRole = isSuper ? 'SUPER_ADMIN' : isAdm ? 'ADMIN' : 'MEMBER';
    const roleDefaultPerms = ROLE_DEFAULT_PERMISSIONS[effectiveRole] || [];
    const allPermissions = Array.from(new Set([...roleDefaultPerms, ...customPermissions, ...(payload.permissions || [])]));

    const user = {
      id: String(memberRecord?.id || payload.id || payload.sub),
      supabaseUserId: supabaseUser?.id || payload.sub || null,
      name: memberRecord?.name || payload.name || 'Member',
      mobile: memberRecord?.mobile || payload.mobile || '',
      email: memberRecord?.email || payload.email || '',
      photoUrl: memberRecord?.photo_url || payload.photoUrl || '',
      status: memberRecord?.status || 'active',
      role: memberRecord?.role || (isAdm ? 'ADMIN' : 'MEMBER'),
      systemRole: effectiveRole,
      isAdmin: isAdm,
      isSuperAdmin: isSuper,
      villageId: memberRecord?.village_id ? String(memberRecord.village_id) : payload.villageId || '1',
      organizationName: memberRecord?.organization_name || 'ग्रामोदय यूथ मंच',
      permissions: allPermissions,
    };

    return NextResponse.json({
      authenticated: true,
      user,
      member: user,
      role: effectiveRole,
      isAdmin: isAdm,
      isSuperAdmin: isSuper,
      permissions: allPermissions,
      token: token || null,
    });
  } catch (err: any) {
    console.error('Error verifying auth session in /api/auth/me:', err);
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}
