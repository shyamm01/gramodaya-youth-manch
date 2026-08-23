import { SignJWT, jwtVerify } from 'jose';
import { NextResponse } from 'next/server';
import { SystemRole, PermissionCode } from '../types';
import { ROLE_DEFAULT_PERMISSIONS, hasUserPermission, isSuperAdmin } from './permissions';
import { getServerSupabase } from './supabaseServer';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { getSqlClient } from './authUtils';

const JWT_SECRET_STRING =
  process.env.SUPABASE_JWT_SECRET ||
  process.env.JWT_SECRET ||
  'gym_secure_supabase_jwt_secret_key_2026_production';

const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export interface JwtUserPayload {
  sub: string;
  id: string;
  name: string;
  mobile: string;
  email?: string;
  role: SystemRole;
  systemRole: SystemRole;
  villageId?: string;
  accessibleVillages?: string[];
  permissions?: PermissionCode[];
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  [key: string]: any;
}

/**
 * Generate a signed JWT authentication token
 */
export async function signJwtToken(
  payload: Omit<JwtUserPayload, 'sub'>,
  expiresIn = '7d'
): Promise<string> {
  const effectiveRole = payload.role || payload.systemRole || 'MEMBER';
  const effectivePermissions =
    payload.permissions && payload.permissions.length > 0
      ? payload.permissions
      : ROLE_DEFAULT_PERMISSIONS[effectiveRole] || [];

  const isSuper = effectiveRole === 'SUPER_ADMIN';
  const isAdm = isSuper || effectiveRole === 'ADMIN';

  return await new SignJWT({
    ...payload,
    role: effectiveRole,
    systemRole: effectiveRole,
    permissions: effectivePermissions,
    isAdmin: isAdm,
    isSuperAdmin: isSuper,
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(payload.id || payload.mobile)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setIssuer('gramodaya-youth-manch')
    .sign(JWT_SECRET);
}

/**
 * Enrich user payload with authoritative profile & permissions from PostgreSQL public.profiles
 */
async function enrichUserFromProfile(user: JwtUserPayload): Promise<JwtUserPayload> {
  const sql = getSqlClient();
  if (!sql) return user;
  try {
    const rows = await sql`
      SELECT id, full_name, mobile, email, status, role, system_role, village_id, is_approved
      FROM public.profiles
      WHERE id = ${user.id}::uuid
         OR (email IS NOT NULL AND email ILIKE ${user.email || ''})
         OR (mobile IS NOT NULL AND REGEXP_REPLACE(mobile, '\\D', '', 'g') LIKE ${'%' + (user.mobile || '').replace(/\D/g, '').slice(-10)})
      LIMIT 1
    `;
    if (rows && rows.length > 0) {
      const p = rows[0];
      const rawSys = (p.system_role || user.systemRole || 'MEMBER') as SystemRole;
      const isSuper = rawSys === 'SUPER_ADMIN';
      const sysRole: SystemRole = isSuper ? 'SUPER_ADMIN' : rawSys === 'ADMIN' ? 'ADMIN' : 'MEMBER';
      const isAdm = isSuper || sysRole === 'ADMIN' || p.role === 'ADMIN';

      // Fetch user custom module permissions
      let customPerms: PermissionCode[] = [];
      try {
        const permRows = await sql`
          SELECT up.can_read, up.can_write, up.can_update, up.can_delete, m.slug as module_slug
          FROM public.user_permissions up
          JOIN public.modules m ON up.module_id = m.id
          WHERE up.user_id = ${p.id}
        `;
        if (permRows && permRows.length > 0) {
          for (const r of permRows) {
            const slug = r.module_slug;
            if (r.can_read) customPerms.push(`${slug}:view` as PermissionCode);
            if (r.can_write) {
              customPerms.push(
                `${slug}:create` as PermissionCode,
                `${slug}:upload` as PermissionCode,
                `${slug}:participate` as PermissionCode
              );
            }
            if (r.can_update) {
              customPerms.push(
                `${slug}:update` as PermissionCode,
                `${slug}:update_status` as PermissionCode,
                `${slug}:resolve` as PermissionCode,
                `${slug}:publish` as PermissionCode,
                `${slug}:moderate` as PermissionCode
              );
            }
            if (r.can_delete) {
              customPerms.push(`${slug}:delete` as PermissionCode);
            }
          }
        }
      } catch (permErr) {
        // Ignore perm fetch error
      }

      const defaultPerms = ROLE_DEFAULT_PERMISSIONS[sysRole] || [];
      const allPerms = Array.from(new Set([...defaultPerms, ...customPerms, ...(user.permissions || [])])) as PermissionCode[];

      // Fetch the villages this user is explicitly granted a role in (public.user_village_roles).
      // SUPER_ADMIN is left unrestricted (undefined) — permission checks elsewhere already
      // treat an empty/absent accessibleVillages list as "no village restriction".
      let accessibleVillages: string[] | undefined;
      if (!isSuper) {
        try {
          const villageRoleRows = await sql`
            SELECT village_id FROM public.user_village_roles WHERE user_id = ${p.id}
          `;
          const villageIds = new Set<string>(
            villageRoleRows.map((r: any) => String(r.village_id))
          );
          if (p.village_id) {
            villageIds.add(String(p.village_id));
          }
          if (villageIds.size > 0) {
            accessibleVillages = Array.from(villageIds);
          }
        } catch (villageRoleErr) {
          // Ignore — falls back to no restriction rather than blocking the user out.
        }
      }

      return {
        ...user,
        id: String(p.id),
        sub: String(p.id),
        name: p.full_name || user.name,
        mobile: p.mobile || user.mobile,
        email: p.email || user.email,
        role: sysRole,
        systemRole: sysRole,
        villageId: p.village_id ? String(p.village_id) : user.villageId || '8',
        isAdmin: isAdm,
        isSuperAdmin: isSuper,
        permissions: allPerms,
        accessibleVillages: accessibleVillages || user.accessibleVillages,
      };
    }
  } catch (err) {
    // Ignore db fallback error
  }
  return user;
}

/**
 * Verify and decode JWT token (supports both app-signed JWTs and Supabase Auth tokens)
 */
export async function verifyJwtToken(token: string): Promise<JwtUserPayload | null> {
  if (!token) return null;

  const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
  if (!cleanToken) return null;

  // 1. First try app-signed HMAC verification
  try {
    const { payload } = await jwtVerify(cleanToken, JWT_SECRET, {
      issuer: 'gramodaya-youth-manch',
    });
    if (payload) {
      return await enrichUserFromProfile(payload as unknown as JwtUserPayload);
    }
  } catch (e) {
    // Continue to Supabase Auth token verification
  }

  // 2. Try Supabase Auth user verification
  try {
    const supabase = getServerSupabase();
    if (supabase) {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(cleanToken);
      if (user && !error) {
        const metadata = user.user_metadata || {};
        const appMetadata = user.app_metadata || {};
        const role = (appMetadata.role || metadata.role || 'MEMBER') as SystemRole;
        const isSuper = role === 'SUPER_ADMIN';
        const isAdm = isSuper || role === 'ADMIN';

        const baseUser: JwtUserPayload = {
          sub: user.id,
          id: user.id,
          name: metadata.full_name || metadata.name || user.email || 'Supabase User',
          mobile: metadata.mobile || '',
          email: user.email,
          role: isSuper ? 'SUPER_ADMIN' : role,
          systemRole: isSuper ? 'SUPER_ADMIN' : role,
          villageId: metadata.villageId || '8',
          permissions: metadata.permissions || ROLE_DEFAULT_PERMISSIONS[isSuper ? 'SUPER_ADMIN' : role] || [],
          isAdmin: isAdm,
          isSuperAdmin: isSuper,
        };

        return await enrichUserFromProfile(baseUser);
      }
    }
  } catch (e) {
    // Verification failed
  }

  return null;
}

export const AUTH_COOKIE_NAME = 'gym_auth_token';

/**
 * Attach secure HTTP-Only JWT Cookie to Response
 */
export function setAuthCookie(response: Response, token: string) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieValue = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax; HttpOnly${isProd ? '; Secure' : ''}`;
  response.headers.append('Set-Cookie', cookieValue);
  return response;
}

/**
 * Clear Authentication Cookie from Response
 */
export function clearAuthCookie(response: Response) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieValue = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly${isProd ? '; Secure' : ''}`;
  response.headers.append('Set-Cookie', cookieValue);
  return response;
}

/**
 * Extract token from Request (Authorization header or cookies)
 */
export function extractTokenFromRequest(req: Request): string | null {
  // 1. Authorization header
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 2. Cookie header
  const cookieHeader = req.headers.get('cookie') || req.headers.get('Cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:gym_auth_token|auth-token|sb-access-token)=([^;]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}

/**
 * Require Authentication & RBAC role / permission authorization
 */
export async function authenticateRequest(
  req: Request,
  requiredPermission?: PermissionCode,
  requiredRole?: SystemRole
): Promise<
  | { success: true; user: JwtUserPayload }
  | { success: false; status: number; error: string }
> {
  let token = extractTokenFromRequest(req);
  let user: JwtUserPayload | null = null;

  // 1. Try verifying extracted token
  if (token) {
    user = await verifyJwtToken(token);
  }

  // 2. If still no user, check Supabase Server Client cookie session
  if (!user) {
    try {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user: sbUser },
        error,
      } = await supabase.auth.getUser();

      if (sbUser && !error) {
        const metadata = sbUser.user_metadata || {};
        const appMetadata = sbUser.app_metadata || {};
        const role = (appMetadata.role || metadata.role || 'MEMBER') as SystemRole;
        const isSuper = role === 'SUPER_ADMIN';
        const isAdm = isSuper || role === 'ADMIN';

        const baseUser: JwtUserPayload = {
          sub: sbUser.id,
          id: sbUser.id,
          name: metadata.full_name || metadata.name || sbUser.email || 'Supabase User',
          mobile: metadata.mobile || '',
          email: sbUser.email,
          role: isSuper ? 'SUPER_ADMIN' : role,
          systemRole: isSuper ? 'SUPER_ADMIN' : role,
          villageId: metadata.villageId || '8',
          permissions: metadata.permissions || ROLE_DEFAULT_PERMISSIONS[isSuper ? 'SUPER_ADMIN' : role] || [],
          isAdmin: isAdm,
          isSuperAdmin: isSuper,
        };

        user = await enrichUserFromProfile(baseUser);
      }
    } catch (e) {
      // Supabase SSR session check failed
    }
  }

  if (!user) {
    return {
      success: false,
      status: 401,
      error: 'प्रमाणीकरण आवश्यक है (Authentication required)। कृपया लॉगिन करें।',
    };
  }

  // 3. RBAC: Check Role requirement
  if (requiredRole) {
    if (requiredRole === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN' && !user.isSuperAdmin) {
      return {
        success: false,
        status: 403,
        error: 'यह कार्य केवल मुख्य प्रशासक (Super Admin) द्वारा अधिकृत है। (Super Admin Required)',
      };
    }
    if (
      requiredRole === 'ADMIN' &&
      user.role !== 'SUPER_ADMIN' &&
      user.role !== 'ADMIN' &&
      !user.isAdmin
    ) {
      return {
        success: false,
        status: 403,
        error: 'यह कार्य केवल अधिकृत ग्राम प्रशासक (Admin) द्वारा अधिकृत है। (Admin Required)',
      };
    }
  }

  // 4. RBAC: Check Permission requirement
  if (requiredPermission) {
    const isSuper = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
    const hasPerm =
      isSuper ||
      (user.permissions && user.permissions.includes(requiredPermission)) ||
      hasUserPermission(user as any, requiredPermission);

    if (!hasPerm) {
      return {
        success: false,
        status: 403,
        error: `इस कार्य हेतु अनुमति (${requiredPermission}) उपलब्ध नहीं है। (Permission Denied)`,
      };
    }
  }

  return { success: true, user };
}

export type AuthResult =
  | { success: true; user: JwtUserPayload; response?: undefined }
  | { success: false; response: NextResponse; user?: undefined };

/**
 * Clean 1-line helper for Next.js Route Handlers to verify authentication & permissions
 */
export async function requireAuth(
  req: Request,
  requiredPermission?: PermissionCode,
  requiredRole?: SystemRole
): Promise<AuthResult> {
  const result = await authenticateRequest(req, requiredPermission, requiredRole);
  if (result.success === false) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      ),
    };
  }
  return { success: true, user: result.user };
}
