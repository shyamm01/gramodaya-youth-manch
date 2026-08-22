import { extractTokenFromRequest, verifyJwtToken } from './jwtAuth';
import { getDb } from '../db';
import { villages } from '../db/schema';
import { asc, eq } from 'drizzle-orm';

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

// ── Village references for writes ────────────────────────────────────────────

/**
 * village_id is a foreign key, so a write must not pass an id that has no row.
 *
 * The routes used to default to 1, which is not a village on every deployment —
 * this database's only village is 8 — and every create against a village-scoped
 * table failed on the foreign key with a 500. Resolving through here verifies
 * the id first and falls back to a real village, or to NULL where the column
 * allows it, so a create can no longer fail on a number nobody chose.
 */
let cachedFallbackVillageId: number | null | undefined;

async function firstExistingVillageId(): Promise<number | null> {
  if (cachedFallbackVillageId !== undefined) return cachedFallbackVillageId;
  const db = getDb();
  if (!db) return null;
  try {
    const [row] = await db
      .select({ id: villages.id })
      .from(villages)
      .orderBy(asc(villages.id))
      .limit(1);
    cachedFallbackVillageId = row?.id ?? null;
  } catch {
    cachedFallbackVillageId = null;
  }
  return cachedFallbackVillageId;
}

/** Verified village id for a write, or null when no village exists at all. */
export async function resolveVillageRef(villageId: unknown): Promise<number | null> {
  const numeric = Number(villageId);
  if (Number.isFinite(numeric) && numeric > 0) {
    const db = getDb();
    if (!db) return null;
    try {
      const [row] = await db
        .select({ id: villages.id })
        .from(villages)
        .where(eq(villages.id, numeric))
        .limit(1);
      if (row) return row.id;
    } catch {
      return null;
    }
  }
  return firstExistingVillageId();
}
