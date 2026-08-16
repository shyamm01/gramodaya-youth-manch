import { NextResponse } from 'next/server';
import { getSqlClient, normalizeMobile } from '@/src/lib/authUtils';
import { getOtpStore } from '@/src/lib/serverStore';
import { getServerSupabase } from '@/src/lib/supabaseServer';

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

    const sql = getSqlClient();
    if (!sql) {
      return NextResponse.json({ error: 'डेटाबेस कनेक्शन अनुपलब्ध है।' }, { status: 500 });
    }

    const rows = await sql`
      SELECT id FROM public.profiles
      WHERE REGEXP_REPLACE(mobile, '\\D', '', 'g') LIKE ${'%' + digits}
      LIMIT 1;
    `;
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'यह मोबाइल नंबर पंजीकृत सदस्य सूची में नहीं मिला।' }, { status: 404 });
    }

    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'प्रमाणीकरण सेवा अनुपलब्ध है।' }, { status: 500 });
    }

    const { error } = await supabase.auth.admin.updateUserById(rows[0].id, { password: newPassword });
    if (error) {
      return NextResponse.json({ error: 'पासवर्ड रीसेट करने में त्रुटि हुई। कृपया पुनः प्रयास करें।' }, { status: 500 });
    }

    otpStore.delete(digits);

    return NextResponse.json({
      success: true,
      message: 'आपका नया पासवर्ड सफलतापूर्वक सेट हो गया है! अब आप पासवर्ड से लॉगिन कर सकते हैं।',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error resetting password' }, { status: 500 });
  }
}
