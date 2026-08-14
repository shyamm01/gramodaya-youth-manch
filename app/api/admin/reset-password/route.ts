import { NextResponse } from 'next/server';
import {
  loadStore,
  saveStore,
  logAuditAction,
  normalizeMobile,
  isAuthorizedAdminMobile,
  hashPassword,
  getOtpStore,
} from '@/src/lib/serverStore';

export async function POST(req: Request) {
  try {
    const { mobile, otp, newPassword } = await req.json();
    if (!mobile || !otp || !newPassword) {
      return NextResponse.json({ error: 'एडमिन मोबाइल, ओटीपी और नया पासवर्ड आवश्यक हैं।' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'नया पासवर्ड कम से कम ६ अक्षरों का होना चाहिए।' }, { status: 400 });
    }

    const digits = normalizeMobile(mobile);

    if (!isAuthorizedAdminMobile(digits)) {
      return NextResponse.json({ error: 'यह मोबाइल नंबर अधिकृत मुख्य एडमिन सूची में नहीं है।' }, { status: 403 });
    }

    const otpStore = getOtpStore();
    const record = otpStore.get(digits);
    const isValidOtp = record && record.otp === otp.trim() && Date.now() <= record.expires;

    if (!isValidOtp) {
      return NextResponse.json({ error: 'अमान्य या समाप्त हो चुका ओटीपी।' }, { status: 400 });
    }

    const store = loadStore();
    const admin = store.admins.find((a) => normalizeMobile(a.mobile) === digits);
    const key = admin?.id || digits;

    const hash = hashPassword(newPassword);
    store.adminPasswords[key] = hash;
    store.adminPasswords[digits] = hash;

    store.admins = store.admins.map((a) => {
      if (normalizeMobile(a.mobile) === digits) {
        return { ...a, hasPasswordSet: true };
      }
      return a;
    });

    saveStore(store);

    logAuditAction('Admin Password Reset via OTP', admin?.name || 'Main Admin', digits, 'Admin Security');

    return NextResponse.json({
      success: true,
      message: 'एडमिन पासवर्ड सफलतापूर्वक रीसेट हो गया है! अब नए पासवर्ड से लॉगिन करें।',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error resetting password' }, { status: 500 });
  }
}
