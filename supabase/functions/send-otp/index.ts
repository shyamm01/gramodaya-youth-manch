// Supabase Edge Function: send-otp
// Deno TypeScript Runtime

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory OTP storage for Edge Function instance
const edgeOtpStore = new Map<string, { otp: string; expires: number }>();

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { mobile, role = 'MEMBER' } = body;

    if (!mobile) {
      return new Response(
        JSON.stringify({ success: false, error: 'Mobile number is required (मोबाइल नंबर आवश्यक है)।' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanDigits = String(mobile).replace(/\D/g, '').slice(-10);
    if (cleanDigits.length < 10) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid 10-digit Indian mobile number (कृपया मान्य १० अंकों का मोबाइल नंबर दर्ज करें)।' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate random 6-digit OTP code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    edgeOtpStore.set(cleanDigits, {
      otp: generatedOtp,
      expires: expiresAt,
    });

    console.log(`\n========================================`);
    console.log(`🚀 [SUPABASE EDGE FUNCTION: send-otp]`);
    console.log(`📱 Target Mobile: +91 ${cleanDigits}`);
    console.log(`🔑 Generated OTP: ${generatedOtp} (Role: ${role})`);
    console.log(`⏰ Expiry: ${new Date(expiresAt).toLocaleTimeString()}`);
    console.log(`========================================\n`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `ओटीपी कोड (+91 ${cleanDigits}) पर सफलतापूर्वक भेज दिया गया है।`,
        otp: generatedOtp, // Returned for dev gateway testing
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Error processing send-otp request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
