import { NextResponse } from 'next/server';
import { syncAllDatastoreToSupabase, logAuditAction } from '@/src/lib/serverStore';
import { getServerSupabase } from '@/src/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const { adminName, adminMobile } = await req.json().catch(() => ({}));

    const client = getServerSupabase();
    if (!client) {
      return NextResponse.json({
        success: false,
        error: 'Supabase URL or Key is not configured in server environment.',
      }, { status: 400 });
    }

    const result = await syncAllDatastoreToSupabase();

    if (result.success) {
      logAuditAction(
        `Synchronized local database to Supabase (${result.syncedCount} records)`,
        adminName || 'Admin',
        adminMobile || '',
        'Supabase PostgreSQL Database'
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Sync failed' }, { status: 500 });
  }
}
