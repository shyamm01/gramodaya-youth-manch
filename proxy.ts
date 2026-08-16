import { NextResponse, type NextRequest } from 'next/server';
import { verifyJwtToken } from './src/lib/jwtAuth';
import { updateSession } from './lib/supabase/proxy';

export async function proxy(request: NextRequest) {
  // 1. Update Supabase Auth Session & Cookies (PRD Section 11 & 28)
  const { supabaseResponse, user: supabaseUser } = await updateSession(request);

  const requestHeaders = new Headers(request.headers);

  // 2. If Supabase Auth user is present, inject headers
  if (supabaseUser) {
    requestHeaders.set('x-supabase-user-id', supabaseUser.id);
    if (supabaseUser.email) requestHeaders.set('x-user-email', supabaseUser.email);
    if (!requestHeaders.has('x-user-id')) {
      requestHeaders.set('x-user-id', supabaseUser.id);
    }
  }

  // 3. Extract legacy token from Authorization header or gym_auth_token cookie
  let token: string | null = null;
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  if (!token) {
    token = request.cookies.get('gym_auth_token')?.value || null;
  }

  // 4. Verify custom JWT token and inject user context into request headers
  if (token) {
    try {
      const user = await verifyJwtToken(token);
      if (user) {
        requestHeaders.set('x-user-id', user.id || user.sub);
        requestHeaders.set('x-user-role', user.role || 'MEMBER');
        requestHeaders.set('x-user-system-role', user.systemRole || user.role || 'MEMBER');
        requestHeaders.set('x-user-name', encodeURIComponent(user.name || ''));
        requestHeaders.set('x-user-mobile', user.mobile || '');
        if (user.email) requestHeaders.set('x-user-email', user.email);
        if (user.villageId) requestHeaders.set('x-village-id', user.villageId);
        requestHeaders.set('x-is-admin', user.isAdmin ? 'true' : 'false');
      }
    } catch {
      // invalid token ignored in proxy, handled by individual endpoints
    }
  }

  // 5. Build response preserving Supabase cookies
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Copy cookies from supabaseResponse
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, cookie);
  });

  // Set Permissions-Policy header to allow extension handlers without unload violations
  response.headers.set('Permissions-Policy', 'unload=*');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files & images
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
