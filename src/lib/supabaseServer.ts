import { createClient, SupabaseClient } from '@supabase/supabase-js';

let serverSupabaseClient: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient | null {
  if (serverSupabaseClient) return serverSupabaseClient;

  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (url && key && url.startsWith('http')) {
    try {
      serverSupabaseClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      return serverSupabaseClient;
    } catch (e) {
      console.warn('Failed to initialize server Supabase client:', e);
    }
  }

  return null;
}

/**
 * Sync an entity record to Supabase in the background (fire-and-forget, non-blocking)
 */
export async function syncToSupabase(
  table: string,
  record: Record<string, any>,
  operation: 'upsert' | 'insert' | 'delete' = 'upsert',
  matchField: string = 'id'
): Promise<void> {
  const supabase = getServerSupabase();
  if (!supabase) return;

  try {
    if (operation === 'delete') {
      await supabase.from(table).delete().eq(matchField, record[matchField]);
    } else if (operation === 'insert') {
      await supabase.from(table).insert(record);
    } else {
      await supabase.from(table).upsert(record, { onConflict: matchField });
    }
  } catch (error) {
    // Non-blocking background sync error log
    console.warn(`Supabase sync failed for table ${table}:`, error);
  }
}
