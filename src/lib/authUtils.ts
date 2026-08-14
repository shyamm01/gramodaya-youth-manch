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
