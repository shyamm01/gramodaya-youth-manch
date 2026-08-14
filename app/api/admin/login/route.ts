import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction, normalizeMobile, isAuthorizedAdminMobile, hashPassword } from '@/src/lib/serverStore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mobile, emailOrMobile, password, supabaseAuthSuccess } = body;
    const input = String(emailOrMobile || mobile || '').trim();

    if (!input) {
      return NextResponse.json({ error: 'Email or Mobile number is required.' }, { status: 400 });
    }

    const digits = normalizeMobile(input);
    const isEmailInput = input.includes('@');
    const store = loadStore();

    let admin = store.admins.find((a) => {
      if (isEmailInput && a.email) {
        return a.email.toLowerCase() === input.toLowerCase();
      }
      return normalizeMobile(a.mobile) === digits;
    });

    if (!admin && isAuthorizedAdminMobile(digits)) {
      admin = store.admins.find((a) => normalizeMobile(a.mobile) === digits);
    }

    if (!admin) {
      return NextResponse.json({
        error: 'यह क्रेडेंशियल अधिकृत एडमिन सूची में नहीं है। (Unauthorized Admin)',
      }, { status: 403 });
    }

    // Check password if Supabase Auth wasn't already validated on client
    if (!supabaseAuthSuccess) {
      const key = admin.id || digits;
      const storedHash = store.adminPasswords[key] || store.adminPasswords[digits];

      if (storedHash) {
        const hash = hashPassword(password || '');
        if (hash !== storedHash) {
          return NextResponse.json({ error: 'गलत पासवर्ड। पुनः प्रयास करें। (Incorrect Password)' }, { status: 401 });
        }
      } else {
        // First time setting password upon login
        if (password && password.length >= 6) {
          const hash = hashPassword(password);
          store.adminPasswords[key] = hash;
          store.adminPasswords[digits] = hash;
          saveStore(store);
        } else {
          return NextResponse.json({
            error: 'कृपया इस एडमिन खाते के लिए कम से कम 6 अक्षरों का पासवर्ड दर्ज करें।',
          }, { status: 400 });
        }
      }
    }

    logAuditAction('Admin Login Success', admin.name, admin.mobile, 'Admin Dashboard');

    return NextResponse.json({
      success: true,
      admin,
      token: `session_${admin.id}_${Date.now()}`,
    });
  } catch (err: any) {
    console.error('Admin login error:', err);
    return NextResponse.json({ error: 'लॉगिन प्रक्रिया में आंतरिक त्रुटि हुई।' }, { status: 500 });
  }
}
