import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { eq, or, like } from 'drizzle-orm';
import { requireAuth } from '@/src/lib/jwtAuth';
import { normalizeMobile } from '@/src/lib/authUtils';

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const lang = (body.lang || req.headers.get('x-lang') || 'hi').toLowerCase();
    const isEn = lang === 'en';

    // 1. Authenticate Requester
    const auth = await requireAuth(req);
    if (!auth.success) {
      return NextResponse.json(
        {
          success: false,
          error: isEn
            ? 'Please sign in to invite or add members.'
            : 'सदस्य जोड़ने अथवा आमंत्रित करने के लिए कृपया पहले लॉगिन करें।',
          code: 'UNAUTHENTICATED',
        },
        { status: 401 }
      );
    }

    const currentUser = auth.user;
    const db = getDb();

    // 2. Check if requester is an active/verified member (or Admin/Super Admin)
    const isSuperOrAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';

    if (!isSuperOrAdmin) {
      let isVerified = false;

      if (db) {
        const cleanReqMobile = normalizeMobile(currentUser.mobile || '');
        // Check profiles table first
        try {
          const profileRecord = await db.query.profiles.findFirst({
            where: or(
              eq(schema.profiles.id, currentUser.id),
              currentUser.email ? eq(schema.profiles.email, currentUser.email.toLowerCase().trim()) : undefined,
              cleanReqMobile ? like(schema.profiles.mobile, `%${cleanReqMobile}%`) : undefined
            ),
          });
          if (profileRecord && profileRecord.status === 'active') {
            isVerified = true;
          }
        } catch (e) {}
      }

      // If not verified in DB, check if status is active in auth metadata
      if (!isVerified && currentUser.status === 'active') {
        isVerified = true;
      }

      if (!isVerified) {
        return NextResponse.json(
          {
            success: false,
            error: isEn
              ? 'Your membership is currently pending verification. Only approved active members can add or invite new members.'
              : 'आपकी सदस्यता अभी सत्यापन व स्वीकृति हेतु लंबित है। नए सदस्यों को जोड़ने के लिए आपकी सदस्यता का एडमिन द्वारा स्वीकृत होना आवश्यक है।',
            code: 'MEMBER_NOT_VERIFIED',
            membershipStatus: 'pending',
          },
          { status: 403 }
        );
      }
    }

    // 3. Validate Request Body
    const { name, email, inviterName } = body;

    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!cleanName) {
      return NextResponse.json(
        {
          success: false,
          error: isEn ? 'Member full name is required.' : 'सदस्य का पूरा नाम दर्ज करना आवश्यक है।',
        },
        { status: 400 }
      );
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json(
        {
          success: false,
          error: isEn ? 'Please enter a valid email address.' : 'कृपया एक मान्य ईमेल पता दर्ज करें।',
        },
        { status: 400 }
      );
    }

    // 4. Check if member already exists in DB
    if (db) {
      const existing = await db.query.profiles.findFirst({
        where: eq(schema.profiles.email, cleanEmail),
      });

      if (existing) {
        const isExistingActive = existing.status === 'active';
        return NextResponse.json(
          {
            success: false,
            error: isEn
              ? `This email (${cleanEmail}) is already registered as a member [Status: ${
                  isExistingActive ? 'Active' : 'Pending Verification'
                }].`
              : `यह ईमेल (${cleanEmail}) पहले से सदस्य के रूप में पंजीकृत है [स्थिति: ${
                  isExistingActive ? 'सक्रिय' : 'सत्यापन लंबित'
                }]।`,
            alreadyRegistered: true,
          },
          { status: 409 }
        );
      }
    }

    // 5. Determine base URL and generate invitation link
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const inviteLink = `${origin}/auth/signup?inviteEmail=${encodeURIComponent(cleanEmail)}&inviteName=${encodeURIComponent(cleanName)}`;

    // 6. Try sending invite via Supabase Auth Admin if service role is configured
    let emailSent = false;
    try {
      const supabase = await createClient();
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(cleanEmail, {
        data: {
          full_name: cleanName,
          invited_by: inviterName || currentUser.name || 'Gramodaya Youth Manch',
        },
        redirectTo: inviteLink,
      });

      if (!inviteError) {
        emailSent = true;
      }
    } catch (sbErr) {
      console.warn('Supabase invite trigger note:', sbErr);
    }

    return NextResponse.json({
      success: true,
      emailSent,
      inviteLink,
      name: cleanName,
      email: cleanEmail,
      message: isEn
        ? `Invitation link generated successfully for ${cleanName} (${cleanEmail}).`
        : `${cleanName} (${cleanEmail}) के लिए निमंत्रण लिंक सफलतापूर्वक तैयार हो गया।`,
    });
  } catch (error: any) {
    console.error('Invite generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate invitation.' },
      { status: 500 }
    );
  }
}
