import { NextResponse } from 'next/server';
import { loadStore, saveStore, normalizeMobile, hashPassword } from '@/src/lib/serverStore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mobile, password, supabaseUserId } = body;
    if (!mobile) {
      return NextResponse.json({ error: 'मोबाइल नंबर आवश्यक है।' }, { status: 400 });
    }

    const digits = normalizeMobile(mobile);
    const store = loadStore();
    const memberIndex = store.members.findIndex((m) => normalizeMobile(m.mobile) === digits);

    if (memberIndex === -1) {
      return NextResponse.json({ error: 'यह मोबाइल नंबर पंजीकृत सदस्य सूची में नहीं मिला।' }, { status: 404 });
    }

    const member = store.members[memberIndex];

    if (member.status === 'pending') {
      return NextResponse.json({ error: 'आपका सदस्य आवेदन एडमिन की स्वीकृति हेतु लंबित है।' }, { status: 403 });
    }

    if (password) {
      if (!store.memberPasswords) {
        store.memberPasswords = {};
      }
      const storedHash = store.memberPasswords[digits] || store.memberPasswords[member.id];
      if (storedHash) {
        const hash = hashPassword(password);
        if (hash !== storedHash) {
          return NextResponse.json({ error: 'गलत पासवर्ड। कृपया सही पासवर्ड दर्ज करें अथवा OTP से लॉगिन करें।' }, { status: 401 });
        }
      } else {
        // User created account via OTP/registration and is logging in with password for the first time
        if (password.length >= 6) {
          const hash = hashPassword(password);
          store.memberPasswords[digits] = hash;
          store.memberPasswords[member.id] = hash;
          saveStore(store);
        } else {
          return NextResponse.json({
            error: 'कृपया इस खाते के लिए कम से कम 6 अक्षरों का पासवर्ड दर्ज करें अथवा OTP से लॉगिन करें।',
          }, { status: 400 });
        }
      }
    }

    if (supabaseUserId) {
      store.members[memberIndex].supabaseUserId = supabaseUserId;
      saveStore(store);
    }

    return NextResponse.json({
      success: true,
      member: store.members[memberIndex],
      token: `mem_session_${member.id}_${Date.now()}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error logging in member' }, { status: 500 });
  }
}
