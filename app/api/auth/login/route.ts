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

    // Query Member/Admin from PostgreSQL
    const rows = isEmail
      ? await sql`
          SELECT * FROM public.members 
          WHERE LOWER(email) = ${rawInput.toLowerCase()}
          LIMIT 1;
        `
      : await sql`
          SELECT * FROM public.members 
          WHERE REGEXP_REPLACE(mobile, '\\D', '', 'g') LIKE ${'%' + cleanDigits}
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

    const member = rows[0];

    // Password verification
    if (member.password_hash) {
      if (member.password_hash !== passwordHash) {
        return NextResponse.json(
          { error: 'गलत पासवर्ड। कृपया सही पासवर्ड दर्ज करें (Incorrect Password)।' },
          { status: 401 }
        );
      }
    } else {
      // First-time password assignment
      await sql`
        UPDATE public.members 
        SET password_hash = ${passwordHash}
        WHERE id = ${member.id};
      `;
    }

    const systemRole = member.system_role || member.role || 'MEMBER';
    const isAdmin = systemRole === 'SUPER_ADMIN' || systemRole === 'ADMIN';
    const memberName = member.name || 'Member';
    const memberMobile = member.mobile || `+91 ${cleanDigits}`;

    const token = await signJwtToken({
      id: String(member.id),
      name: memberName,
      mobile: memberMobile,
      email: member.email || undefined,
      role: systemRole,
      systemRole: systemRole,
      villageId: member.village_id ? String(member.village_id) : 'vil_rasoolpur',
      isAdmin,
    });

    logAuditAction(
      isAdmin ? 'Admin Password Login Success' : 'Member Password Login Success',
      memberName,
      memberMobile,
      isAdmin ? 'Admin Dashboard' : 'Unified Portal'
    );

    const userObj = {
      id: String(member.id),
      name: memberName,
      mobile: memberMobile,
      email: member.email || '',
      status: member.status || 'active',
      photoUrl: member.photo_url || '',
      fatherName: member.father_name || '',
      dob: member.dob || '',
      gender: member.gender || '',
      address: member.address || '',
      villageId: member.village_id ? String(member.village_id) : 'vil_rasoolpur',
      occupation: member.occupation || '',
      designation: member.designation || '',
      politicalBackground: member.political_background || '',
      bloodGroup: member.blood_group || '',
      role: member.role || 'MEMBER',
      systemRole: systemRole,
      isAdmin,
      organizationName: member.organization_name || 'ग्रामोदय यूथ मंच',
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
