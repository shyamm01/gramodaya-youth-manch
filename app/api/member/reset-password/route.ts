import { NextResponse } from 'next/server';
import { loadStore, saveStore, normalizeMobile, hashPassword, getOtpStore } from '@/src/lib/serverStore';

export async function POST(req: Request) {
  try {
    const { mobile, otp, newPassword } = await req.json();
    if (!mobile || !otp || !newPassword) {
      return NextResponse.json({ error: 'मोबाइल, ओटीपी और नया पासवर्ड आवश्यक हैं।' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'नया पासवर्ड कम से कम ६ अक्षरों का होना चाहिए।' }, { status: 400 });
    }

    const digits = normalizeMobile(mobile);
    const otpStore = getOtpStore();
    const record = otpStore.get(digits);
    const isValidOtp = record && record.otp === otp.trim() && Date.now() <= record.expires;

    if (!isValidOtp) {
      return NextResponse.json({ error: 'अमान्य या समाप्त हो चुका ओटीपी।' }, { status: 400 });
    }

    const store = loadStore();
    const memberIndex = store.members.findIndex((m) => normalizeMobile(m.mobile) === digits);
    if (memberIndex === -1) {
      return NextResponse.json({ error: 'यह मोबाइल नंबर पंजीकृत सदस्य सूची में नहीं मिला।' }, { status: 404 });
    }

    const hash = hashPassword(newPassword);
    if (!store.memberPasswords) {
      store.memberPasswords = {};
    }
    store.memberPasswords[digits] = hash;
    store.memberPasswords[store.members[memberIndex].id] = hash;

    saveStore(store);

    return NextResponse.json({
      success: true,
      message: 'आपका नया पासवर्ड सफलतापूर्वक सेट हो गया है! अब आप पासवर्ड से लॉगिन कर सकते हैं।',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error resetting password' }, { status: 500 });
  }
}
