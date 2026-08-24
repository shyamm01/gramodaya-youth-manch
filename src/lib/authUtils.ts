import crypto from 'crypto';
import postgres from 'postgres';

const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.POSTGRES_URL;

let sqlClient: postgres.Sql | null = null;

export function getSqlClient(): postgres.Sql | null {
  if (sqlClient) return sqlClient;
  if (connectionString) {
    try {
      sqlClient = postgres(connectionString, {
        max: 5,
        prepare: false,
        ssl: { rejectUnauthorized: false },
      });
      return sqlClient;
    } catch (e) {
      console.warn('Postgres connection failed in db client:', e);
    }
  }
  return null;
}

/**
 * Normalizes any mobile input to 10 clean digits.
 */
export function normalizeMobile(mobile: string): string {
  if (!mobile) return '';
  const digits = String(mobile).replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/**
 * Standard SHA-256 password hasher
 */
export function hashPassword(password: string): string {
  if (!password) return '';
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Maps a raw `public.profiles` row (joined with villages org_name/org_name_hindi)
 * into the camelCase Member DTO shape consumed by the frontend.
 */
export function profileToMemberDTO(profile: Record<string, any>) {
  // `system_role` is the only role column now — the old `role` column was a
  // duplicate of it and was dropped.
  const systemRole = profile.system_role || 'MEMBER';
  // `address` was dropped too: it repeated what house_no / street plus the
  // village relation already say, so it is composed here instead.
  const address =
    profile.address ||
    [profile.house_no, profile.street, profile.village_name_hindi || profile.village_name]
      .filter((part: unknown) => typeof part === 'string' && part.trim())
      .join(', ');
  return {
    id: String(profile.id),
    name: profile.full_name || 'Member',
    mobile: profile.mobile || '',
    email: profile.email || '',
    status: profile.status || 'active',
    photoUrl: profile.avatar_url || '',
    fatherName: profile.father_name || '',
    dob: profile.dob || '',
    gender: profile.gender || '',
    address,
    houseNo: profile.house_no || '',
    street: profile.street || '',
    villageId: profile.village_id ? String(profile.village_id) : '8',
    occupation: profile.occupation || '',
    designation: profile.designation || '',
    politicalBackground: profile.political_background || '',
    bloodGroup: profile.blood_group || '',
    // Kept in the DTO for the frontend's existing shape, derived from systemRole.
    role: systemRole === 'MEMBER' ? 'MEMBER' : 'ADMIN',
    systemRole,
    isAdmin: systemRole === 'SUPER_ADMIN' || systemRole === 'ADMIN',
    organizationName: profile.org_name_hindi || profile.org_name || 'ग्रामोदय यूथ मंच',
  };
}

/**
 * Logs an audit event directly into PostgreSQL public.audit_logs
 */
export async function logAuditAction(
  action: string,
  userName: string = 'System',
  details?: string,
  target?: string
) {
  try {
    const sql = getSqlClient();
    if (sql) {
      await sql`
        INSERT INTO public.audit_logs (
          user_name, action, details, timestamp
        ) VALUES (
          ${userName || 'System'},
          ${action},
          ${details || target || null},
          NOW()
        );
      `;
    }
  } catch (err) {
    console.warn('Failed to insert audit log to Postgres:', err);
  }
}
