import { NextResponse } from 'next/server';
import { extractTokenFromRequest, verifyJwtToken } from '@/src/lib/jwtAuth';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

/**
 * TEMPORARY diagnostic for the `/api/auth/me` -> {"authenticated": false} report.
 *
 * Reports which of the two authentication paths fails and why, WITHOUT leaking
 * token material — cookie values are reduced to their length and a short prefix.
 *
 * DELETE THIS FILE once the cause is identified.
 */
export async function GET(req: Request) {
  // Development only. It reports which cookies reached the server and whether
  // the environment is configured — harmless to the developer, needless
  // exposure in production.
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const out: Record<string, any> = {};

  // ---- 1. What cookies actually reached the server? ----
  try {
    const store = await cookies();
    out.cookiesSeen = store.getAll().map((c) => ({
      name: c.name,
      len: c.value?.length ?? 0,
      prefix: (c.value || '').slice(0, 12),
    }));
  } catch (e: any) {
    out.cookiesSeen = `error: ${e?.message}`;
  }

  out.hasAuthorizationHeader = Boolean(
    req.headers.get('authorization') || req.headers.get('Authorization')
  );

  // ---- 2. Path A: the app's own JWT ----
  const token = extractTokenFromRequest(req);
  out.pathA_customJwt = {
    tokenFound: Boolean(token),
    tokenLen: token?.length ?? 0,
    tokenPrefix: token ? token.slice(0, 12) : null,
    looksLikeJwt: token ? token.split('.').length === 3 : false,
  };
  if (token) {
    try {
      const payload = await verifyJwtToken(token);
      out.pathA_customJwt.verified = Boolean(payload);
      out.pathA_customJwt.resolvedUserId = payload?.id ?? null;
      out.pathA_customJwt.resolvedRole = payload?.systemRole ?? null;
    } catch (e: any) {
      out.pathA_customJwt.verified = false;
      out.pathA_customJwt.error = e?.message;
    }
  }

  // ---- 3. Path B: the Supabase SSR cookie session ----
  out.pathB_supabaseSsr = {};
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    out.pathB_supabaseSsr.userFound = Boolean(data?.user);
    out.pathB_supabaseSsr.userId = data?.user?.id ?? null;
    out.pathB_supabaseSsr.email = data?.user?.email ?? null;
    out.pathB_supabaseSsr.error = error
      ? { name: error.name, status: (error as any).status, message: error.message }
      : null;
  } catch (e: any) {
    out.pathB_supabaseSsr.threw = e?.message;
  }

  // ---- 4. Is the server configured at all? ----
  out.env = {
    hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasPublishableKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hasDatabaseUrl: Boolean(
      process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL
    ),
    hasJwtSecret: Boolean(process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET),
    nodeEnv: process.env.NODE_ENV,
  };

  out.verdict =
    out.pathA_customJwt?.verified || out.pathB_supabaseSsr?.userFound
      ? 'AUTHENTICATED — /api/auth/me should be returning a user'
      : 'NOT AUTHENTICATED — see which path failed above';

  return NextResponse.json(out, { status: 200 });
}
