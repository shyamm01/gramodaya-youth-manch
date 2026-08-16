import { NextResponse } from 'next/server';
import { getSqlClient, normalizeMobile, profileToMemberDTO } from '@/src/lib/authUtils';
import { getServerSupabase } from '@/src/lib/supabaseServer';
import { signJwtToken, setAuthCookie } from '@/src/lib/jwtAuth';

export async function POST(req: Request) {
  try {
    const { mobile, password } = await req.json();

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

    if (!password) {
      return NextResponse.json({ error: 'पासवर्ड दर्ज करना आवश्यक है अथवा OTP से लॉगिन करें।' }, { status: 400 });
    }

    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'प्रमाणीकरण सेवा अनुपलब्ध है।' }, { status: 500 });
    }

    // Members registered by mobile alone use a synthetic <mobile>@gym.org Supabase Auth identity.
    const targetEmail = profile.email || `${digits}@gym.org`;
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password,
    });

    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'गलत पासवर्ड। कृपया सही पासवर्ड दर्ज करें अथवा OTP से लॉगिन करें।' }, { status: 401 });
    }

    // Re-fetch strictly by the authenticated Supabase user id, in case the mobile match was loose.
    const authedRows = await sql`
      SELECT p.*, v.org_name, v.org_name_hindi
      FROM public.profiles p
      LEFT JOIN public.villages v ON p.village_id = v.id
      WHERE p.id = ${authData.user.id}
      LIMIT 1;
    `;
    const authedProfile = authedRows[0] || profile;

    const memberDTO = profileToMemberDTO(authedProfile);

    const token = await signJwtToken({
      id: memberDTO.id,
      name: memberDTO.name,
      mobile: memberDTO.mobile,
      email: memberDTO.email || undefined,
      role: memberDTO.systemRole,
      systemRole: memberDTO.systemRole,
      villageId: memberDTO.villageId,
      isAdmin: memberDTO.isAdmin,
    });

    const response = NextResponse.json({
      success: true,
      member: memberDTO,
      token,
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error logging in member' }, { status: 500 });
  }
}
