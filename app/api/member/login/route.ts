import { NextResponse } from 'next/server';
import { getSqlClient, normalizeMobile, hashPassword } from '@/src/lib/authUtils';
import { signJwtToken, setAuthCookie } from '@/src/lib/jwtAuth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mobile, password, supabaseUserId } = body;
    if (!mobile) {
      return NextResponse.json({ error: 'मोबाइल नंबर आवश्यक है।' }, { status: 400 });
    }

    const digits = normalizeMobile(mobile);

    const sql = getSqlClient();
    if (!sql) {
      return NextResponse.json({ error: 'डेटाबेस कनेक्शन अनुपलब्ध है।' }, { status: 500 });
    }

    // Query from public.profiles (unified table)
    const rows = await sql`
      SELECT p.*, v.org_name, v.org_name_hindi
      FROM public.profiles p
      LEFT JOIN public.villages v ON p.village_id = v.id
      WHERE REGEXP_REPLACE(p.mobile, '\\D', '', 'g') LIKE ${'%' + digits}
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'यह मोबाइल नंबर पंजीकृत सदस्य सूची में नहीं मिला।' }, { status: 404 });
    }

    const profile = rows[0];

    if (profile.status === 'pending') {
      return NextResponse.json({ error: 'आपका सदस्य आवेदन एडमिन की स्वीकृति हेतु लंबित है।' }, { status: 403 });
    }

    // Password verification
    if (password) {
      if (profile.password_hash) {
        const hash = hashPassword(password);
        if (hash !== profile.password_hash) {
          return NextResponse.json({ error: 'गलत पासवर्ड। कृपया सही पासवर्ड दर्ज करें अथवा OTP से लॉगिन करें।' }, { status: 401 });
        }
      } else {
        // First-time password set
        if (password.length >= 6) {
          const hash = hashPassword(password);
          await sql`
            UPDATE public.profiles
            SET password_hash = ${hash}
            WHERE id = ${profile.id};
          `;
        } else {
          return NextResponse.json({
            error: 'कृपया इस खाते के लिए कम से कम 6 अक्षरों का पासवर्ड दर्ज करें अथवा OTP से लॉगिन करें।',
          }, { status: 400 });
        }
      }
    }

    // Link Supabase user ID if provided
    if (supabaseUserId) {
      try {
        await sql`
          UPDATE public.profiles
          SET id = ${supabaseUserId}
          WHERE id = ${profile.id} AND id != ${supabaseUserId};
        `;
      } catch {
        // ID might already match or constraint conflict — ignore
      }
    }

    const systemRole = profile.system_role || profile.role || 'MEMBER';
    const isAdmin = systemRole === 'SUPER_ADMIN' || systemRole === 'ADMIN';
    const memberName = profile.full_name || 'Member';
    const memberMobile = profile.mobile || `+91 ${digits}`;

    const token = await signJwtToken({
      id: String(profile.id),
      name: memberName,
      mobile: memberMobile,
      email: profile.email || undefined,
      role: systemRole,
      systemRole: systemRole,
      villageId: profile.village_id ? String(profile.village_id) : '8',
      isAdmin,
    });

    const member = {
      id: String(profile.id),
      name: memberName,
      mobile: memberMobile,
      email: profile.email || '',
      status: profile.status || 'active',
      photoUrl: profile.avatar_url || '',
      fatherName: profile.father_name || '',
      dob: profile.dob || '',
      gender: profile.gender || '',
      villageId: profile.village_id ? String(profile.village_id) : '8',
      role: profile.role || 'MEMBER',
      systemRole: systemRole,
      isAdmin,
      organizationName: profile.org_name_hindi || profile.org_name || 'ग्रामोदय यूथ मंच',
    };

    const response = NextResponse.json({
      success: true,
      member,
      token,
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error logging in member' }, { status: 500 });
  }
}
