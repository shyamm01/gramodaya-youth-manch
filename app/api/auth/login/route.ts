import { validateRequestBody, authLoginSchema } from '@/src/lib/validations';
import { NextResponse } from 'next/server';
import { getSqlClient, normalizeMobile, logAuditAction, profileToMemberDTO } from '@/src/lib/authUtils';
import { getServerSupabase } from '@/src/lib/supabaseServer';
import { signJwtToken, setAuthCookie } from '@/src/lib/jwtAuth';

export async function POST(req: Request) {
  try {
    const validation = await validateRequestBody(req, authLoginSchema);
    if (!validation.success) {
      return validation.response;
    }
    const { identifier, password } = validation.data;

    const rawInput = String(identifier || '').trim();
    const rawPassword = String(password || '');

    if (!rawInput) {
      return NextResponse.json(
        { error: 'मोबाइल नंबर या ईमेल दर्ज करना आवश्यक है (Mobile number or Email is required)।' },
        { status: 400 }
      );
    }

    if (!rawPassword) {
      return NextResponse.json(
        { error: 'पासवर्ड दर्ज करना आवश्यक है (Password is required)।' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'प्रमाणीकरण सेवा अनुपलब्ध है (Auth service unavailable)।' },
        { status: 500 }
      );
    }

    // Members/Admins registered by mobile alone use a synthetic <mobile>@gym.org
    // Supabase Auth identity (see AppContext.memberLogin) since Supabase Auth requires an email.
    const isEmail = rawInput.includes('@');
    const cleanDigits = normalizeMobile(rawInput);
    const targetEmail = isEmail ? rawInput.toLowerCase() : `${cleanDigits}@gym.org`;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: rawPassword,
    });

    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: 'गलत मोबाइल/ईमेल या पासवर्ड। कृपया पुनः प्रयास करें (Incorrect credentials)।' },
        { status: 401 }
      );
    }

    const sql = getSqlClient();
    if (!sql) {
      return NextResponse.json(
        { error: 'डेटाबेस कनेक्शन अनुपलब्ध है (Database connection unavailable)।' },
        { status: 500 }
      );
    }

    const rows = await sql`
      SELECT p.*, v.org_name, v.org_name_hindi
      FROM public.profiles p
      LEFT JOIN public.villages v ON p.village_id = v.id
      WHERE p.id = ${authData.user.id}
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'खाता प्रोफ़ाइल नहीं मिली (Account profile not found)।' },
        { status: 404 }
      );
    }

    const profile = rows[0];
    const userObj = profileToMemberDTO(profile);

    const token = await signJwtToken({
      id: userObj.id,
      name: userObj.name,
      mobile: userObj.mobile,
      email: userObj.email || undefined,
      role: userObj.systemRole,
      systemRole: userObj.systemRole,
      villageId: userObj.villageId,
      isAdmin: userObj.isAdmin,
    });

    logAuditAction(
      userObj.isAdmin ? 'Admin Password Login Success' : 'Member Password Login Success',
      userObj.name,
      userObj.mobile,
      userObj.isAdmin ? 'Admin Dashboard' : 'Unified Portal'
    );

    const response = NextResponse.json({
      success: true,
      user: userObj,
      token,
      message: userObj.isAdmin ? 'प्रशासक लॉगिन सफल! (Admin login successful)' : 'सदस्य लॉगिन सफल! (Member login successful)',
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'लॉगिन प्रक्रिया में आंतरिक त्रुटि हुई।' },
      { status: 500 }
    );
  }
}
