import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Explicit module-level singleton. @supabase/ssr's own internal cache can fail
// to dedupe across Next.js App Router's per-route code-split chunks, which
// otherwise produces multiple independent GoTrueClient instances competing
// over the same session cookie (one instance's signOut() gets silently
// undone by another instance's auto-refresh timer re-writing the cookie).
let cachedClient: SupabaseClient | undefined;

export function createClient() {
  if (cachedClient) return cachedClient;

  cachedClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      ''
  );
  return cachedClient;
}
