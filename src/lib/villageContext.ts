import { extractTokenFromRequest, verifyJwtToken } from './jwtAuth';

const DEFAULT_VILLAGE_ID = 1;

// verifyJwtToken can fall through to a live Supabase network call for
// non-app-signed tokens, which has no timeout of its own. Public, village-
// scoped routes must never be able to hang on a stale/garbage browser token —
// this is best-effort personalization, not a requirement, so give it a short
// budget and fall back to "anonymous".
const AUTH_LOOKUP_TIMEOUT_MS = 3_000;

async function resolveUserWithTimeout(token: string) {
  return Promise.race([
    verifyJwtToken(token),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), AUTH_LOOKUP_TIMEOUT_MS)),
  ]);
}

/**
 * Resolves which village's data a village-scoped request should serve.
 * Derived from the authenticated user's own village grant (JWT
 * accessibleVillages/villageId) rather than trusting a client-supplied query
 * param — an explicit ?villageId= override is only honored when the token's
 * own permissions actually allow it (privileged roles, or a listed grant).
 * Generic — usable by any route that needs "which village is this for", not
 * specific to any one page.
 */
export async function resolveVillageId(req: Request): Promise<number> {
  const token = extractTokenFromRequest(req);
  const user = token ? await resolveUserWithTimeout(token) : null;

  let numericVillageId = DEFAULT_VILLAGE_ID;
  if (user?.villageId && !isNaN(Number(user.villageId))) {
    numericVillageId = Number(user.villageId);
  }

  const url = new URL(req.url);
  const requestedVillageIdParam = url.searchParams.get('villageId');
  const requestedVillageId =
    requestedVillageIdParam && !isNaN(Number(requestedVillageIdParam))
      ? Number(requestedVillageIdParam)
      : null;

  if (requestedVillageId !== null && user) {
    const isPrivileged =
      user.isAdmin || user.isSuperAdmin || user.systemRole === 'ADMIN' || user.systemRole === 'SUPER_ADMIN';
    const hasGrantedAccess = (user.accessibleVillages || []).includes(String(requestedVillageId));
    if (isPrivileged || hasGrantedAccess) {
      numericVillageId = requestedVillageId;
    }
  }

  return numericVillageId;
}

/**
 * Small in-process TTL cache, keyed by villageId. Give each route its own
 * instance (own Map, own independent misses) — a slow/failing endpoint must
 * never affect another endpoint's cache or availability.
 */
export function createTtlCache<T>(ttlMs: number) {
  const cache = new Map<number, { data: T; expiresAt: number }>();
  return {
    get(key: number): T | undefined {
      const hit = cache.get(key);
      if (hit && hit.expiresAt > Date.now()) {
        return hit.data;
      }
      return undefined;
    },
    set(key: number, data: T) {
      cache.set(key, { data, expiresAt: Date.now() + ttlMs });
    },
  };
}
