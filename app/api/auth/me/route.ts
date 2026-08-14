import { NextResponse } from 'next/server';
import { extractTokenFromRequest, verifyJwtToken } from '@/src/lib/jwtAuth';
import { getSqlClient } from '@/src/lib/authUtils';

export async function GET(req: Request) {
  try {
    const token = extractTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const payload = await verifyJwtToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const sql = getSqlClient();
    let memberRecord: any = null;

    if (sql) {
      if (payload.id && !isNaN(Number(payload.id))) {
        const rows = await sql`SELECT * FROM public.members WHERE id = ${Number(payload.id)} LIMIT 1`;
        if (rows && rows.length > 0) memberRecord = rows[0];
      }
      if (!memberRecord && payload.mobile) {
        const cleanDigits = payload.mobile.replace(/\D/g, '').slice(-10);
        const rows = await sql`
          SELECT * FROM public.members 
          WHERE REGEXP_REPLACE(mobile, '\\D', '', 'g') LIKE ${'%' + cleanDigits}
          LIMIT 1
        `;
        if (rows && rows.length > 0) memberRecord = rows[0];
      }
    }

    const isAdm = payload.isAdmin || payload.role === 'SUPER_ADMIN' || payload.role === 'ADMIN' || memberRecord?.system_role === 'SUPER_ADMIN' || memberRecord?.system_role === 'ADMIN';
    const effectiveRole = memberRecord?.system_role || payload.systemRole || payload.role || (isAdm ? 'ADMIN' : 'MEMBER');

    const user = {
      id: String(memberRecord?.id || payload.id || payload.sub),
      name: memberRecord?.name || payload.name || 'Member',
      mobile: memberRecord?.mobile || payload.mobile || '',
      email: memberRecord?.email || payload.email || '',
      photoUrl: memberRecord?.photo_url || payload.photoUrl || '',
      status: memberRecord?.status || 'active',
      role: memberRecord?.role || (isAdm ? 'ADMIN' : 'MEMBER'),
      systemRole: effectiveRole,
      isAdmin: isAdm,
      villageId: memberRecord?.village_id ? String(memberRecord.village_id) : (payload.villageId || 'vil_rasoolpur'),
      organizationName: memberRecord?.organization_name || 'ग्रामोदय यूथ मंच',
      permissions: payload.permissions || [],
    };

    return NextResponse.json({
      authenticated: true,
      user,
      member: user,
      role: effectiveRole,
      isAdmin: isAdm,
      token,
    });
  } catch (err: any) {
    console.error('Error verifying auth session:', err);
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}
