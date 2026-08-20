import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Auth Callback Route (PRD Section 16)
 * Handles OAuth & email verification redirect callbacks, exchanges the code for a session,
 * and securely redirects the user to the destination.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  let next = searchParams.get('next') ?? '/dashboard';

  // Prevent open redirect attacks by ensuring next is a relative path
  if (!next.startsWith('/') || next.startsWith('//')) {
    next = '/dashboard';
  }

  // Supabase/Google can attach an error directly to the callback (e.g. rejected redirect URL)
  const upstreamError = searchParams.get('error_description') || searchParams.get('error');
  if (upstreamError) {
    console.error('Auth callback upstream error:', upstreamError);
    return NextResponse.redirect(
      `${origin}/auth/error?reason=oauth_failed&error_description=${encodeURIComponent(upstreamError)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    console.error('Auth callback exchange error:', error.message);
    return NextResponse.redirect(
      `${origin}/auth/error?reason=callback_failed&error_description=${encodeURIComponent(error.message)}`
    );
  }

  // If code is missing, redirect to error page
  return NextResponse.redirect(`${origin}/auth/error?reason=callback_failed`);
}
