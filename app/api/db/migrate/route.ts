import { NextResponse } from 'next/server';
import { getDb } from '@/src/db';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import path from 'path';
import { logAuditAction } from '@/src/lib/serverStore';
import { requireAuth } from '@/src/lib/jwtAuth';

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req, undefined, 'SUPER_ADMIN');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const connectionString =
      process.env.DATABASE_URL ||
      process.env.SUPABASE_DB_URL ||
      process.env.POSTGRES_URL;

    if (!connectionString) {
      return NextResponse.json(
        { success: false, error: 'DATABASE_URL or SUPABASE_DB_URL is not configured.' },
        { status: 500 }
      );
    }

    const { adminName, adminMobile } = await req.json().catch(() => ({}));

    let migrationClient: postgres.Sql | null = null;

    try {
      migrationClient = postgres(connectionString, {
        max: 1,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      });

      const db = (await import('drizzle-orm/postgres-js')).drizzle(migrationClient);
      const migrationsFolder = path.join(process.cwd(), 'drizzle');

      await migrate(db, {
        migrationsFolder,
        migrationsTable: '__drizzle_migrations',
        migrationsSchema: 'public',
      });

      logAuditAction(
        'Executed Drizzle Database Migrations',
        adminName || currentUser.name || 'Super Admin',
        adminMobile || currentUser.mobile || '',
        'PostgreSQL Database Schema'
      );

      return NextResponse.json({
        success: true,
        message: 'All Drizzle ORM migrations applied successfully.',
      });
    } finally {
      if (migrationClient) {
        await migrationClient.end();
      }
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Migration execution failed.' },
      { status: 500 }
    );
  }
}
