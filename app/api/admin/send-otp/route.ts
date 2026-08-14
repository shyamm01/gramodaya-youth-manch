import { NextResponse } from 'next/server';
import { normalizeMobile, getOtpStore } from '@/src/lib/serverStore';

export async function POST(req: Request) {
  try {
    const { mobile } = await req.json();
    if (!mobile) {
      return NextResponse.json({ error: 'मोबाइल नंबर आवश्यक है।' }, { status: 400 });
    }

    const digits = normalizeMobile(mobile);
    if (!digits || digits.length < 10) {
      return NextResponse.json({ error: 'कृपया मान्य १० अंकों का भारतीय मोबाइल नंबर दर्ज करें।' }, { status: 400 });
    }

    // Generate random 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpStore = getOtpStore();
    otpStore.set(digits, {
      otp: generatedOtp,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes expiry
    });

    console.log(`\n========================================`);
    console.log(`📲 [SMS OTP GATEWAY] Mobile: +91 ${digits}`);
    console.log(`🔑 OTP Code: ${generatedOtp} (Valid for 10 minutes)`);
    console.log(`========================================\n`);

    return NextResponse.json({
      success: true,
      message: `ओटीपी कोड आपके मोबाइल नंबर (+91 ${digits}) के संदेश इनबॉक्स में भेज दिया गया है।`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error sending OTP' }, { status: 500 });
  }
}
