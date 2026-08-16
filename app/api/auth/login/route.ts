import { validateRequestBody, authLoginSchema } from '@/src/lib/validations';
import { NextResponse } from 'next/server';
import { getSqlClient, normalizeMobile, hashPassword, logAuditAction } from '@/src/lib/authUtils';
import { signJwtToken, setAuthCookie } from '@/src/lib/jwtAuth';

export async function POST(req: Request) {
  try {
    const validation = await validateRequestBody(req, authLoginSchema);
    if (!validation.success) {
      return validation.response;
    }
    const { mobile, password } = validation.data;
    const identifier = mobile;
    const emailOrMobile = mobile;
    const email = mobile.includes("@") ? mobile : undefined;
    const rawInput = String(identifier || emailOrMobile || mobile || email || '').trim();
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

    const sql = getSqlClient();
    if (!sql) {
      return NextResponse.json(
        { error: 'डेटाबेस कनेक्शन अनुपलब्ध है (Database connection unavailable)।' },
        { status: 500 }
      );
    }

    const isEmail = rawInput.includes('@');
    const cleanDigits = normalizeMobile(rawInput);
    const passwordHash = hashPassword(rawPassword);

    // Query from public.profiles (unified table — legacy public.members was dropped)
    const rows = isEmail
      ? await sql`
          SELECT p.*, v.org_name, v.org_name_hindi
          FROM public.profiles p
          LEFT JOIN public.villages v ON p.village_id = v.id
          WHERE LOWER(p.email) = ${rawInput.toLowerCase()}
          LIMIT 1;
        `
      : await sql`
          SELECT p.*, v.org_name, v.org_name_hindi
          FROM public.profiles p
          LEFT JOIN public.villages v ON p.village_id = v.id
          WHERE REGEXP_REPLACE(p.mobile, '\\D', '', 'g') LIKE ${'%' + cleanDigits}
          LIMIT 1;
        `;

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        {
          error:
            'यह मोबाइल नंबर या ईमेल पंजीकृत नहीं है। कृपया पहले "नया खाता बनाएं" पर क्लिक करें। (Account not found. Please sign up.)',
        },
        { status: 404 }
      );
    }

    const profile = rows[0];

    // Password verification
    if (profile.password_hash) {
      if (profile.password_hash !== passwordHash) {
        return NextResponse.json(
          { error: 'गलत पासवर्ड। कृपया सही पासवर्ड दर्ज करें (Incorrect Password)।' },
          { status: 401 }
        );
      }
    } else {
      // First-time password assignment
      await sql`
        UPDATE public.profiles
        SET password_hash = ${passwordHash}
        WHERE id = ${profile.id};
      `;
    }

    const systemRole = profile.system_role || profile.role || 'MEMBER';
    const isAdmin = systemRole === 'SUPER_ADMIN' || systemRole === 'ADMIN';
    const memberName = profile.full_name || 'Member';
    const memberMobile = profile.mobile || `+91 ${cleanDigits}`;

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

    logAuditAction(
      isAdmin ? 'Admin Password Login Success' : 'Member Password Login Success',
      memberName,
      memberMobile,
      isAdmin ? 'Admin Dashboard' : 'Unified Portal'
    );

    const userObj = {
      id: String(profile.id),
      name: memberName,
      mobile: memberMobile,
      email: profile.email || '',
      status: profile.status || 'active',
      photoUrl: profile.avatar_url || '',
      fatherName: profile.father_name || '',
      dob: profile.dob || '',
      gender: profile.gender || '',
      address: '',
      villageId: profile.village_id ? String(profile.village_id) : '8',
      occupation: profile.occupation || '',
      designation: profile.designation || '',
      politicalBackground: profile.political_background || '',
      bloodGroup: profile.blood_group || '',
      role: profile.role || 'MEMBER',
      systemRole: systemRole,
      isAdmin,
      organizationName: profile.org_name_hindi || profile.org_name || 'ग्रामोदय यूथ मंच',
    };

    const response = NextResponse.json({
      success: true,
      user: userObj,
      token,
      message: isAdmin ? 'प्रशासक लॉगिन सफल! (Admin login successful)' : 'सदस्य लॉगिन सफल! (Member login successful)',
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
