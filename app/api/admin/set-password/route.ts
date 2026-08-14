import { NextResponse } from 'next/server';
import {
  loadStore,
  saveStore,
  logAuditAction,
  normalizeMobile,
  isAuthorizedAdminMobile,
  hashPassword,
} from '@/src/lib/serverStore';

export async function POST(req: Request) {
  try {
    const { mobile, emailOrMobile, password } = await req.json();
    const input = emailOrMobile || mobile || '';
    if (!input || !password) {
      return NextResponse.json({ error: 'Email/Mobile and Password are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
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
      return NextResponse.json({ error: 'यह ईमेल/मोबाइल अधिकृत एडमिन के रूप में दर्ज नहीं है।' }, { status: 403 });
    }

    const hash = hashPassword(password);
    const key = admin.id || digits;
    store.adminPasswords[key] = hash;
    if (digits) store.adminPasswords[digits] = hash;

    store.admins = store.admins.map((a) => {
      if (a.id === admin.id || normalizeMobile(a.mobile) === digits) {
        return { ...a, hasPasswordSet: true };
      }
      return a;
    });

    saveStore(store);

    logAuditAction('Set Admin Password', admin.name, admin.mobile, 'Admin Security');

    return NextResponse.json({
      success: true,
      message: 'Password created successfully! You can now login.',
      admin,
      token: `session_${admin.id}_${Date.now()}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error setting password' }, { status: 500 });
  }
}
