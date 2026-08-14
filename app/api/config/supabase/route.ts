import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';

export async function POST(req: Request) {
  try {
    const { url, anonKey } = await req.json();
    if (!url || !anonKey) {
      return NextResponse.json({ error: 'URL and Anon Key are required.' }, { status: 400 });
    }

    const cleanUrl = String(url).trim();
    const cleanKey = String(anonKey).trim();

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      return NextResponse.json({ error: 'URL must start with http:// or https://' }, { status: 400 });
    }

    process.env.VITE_SUPABASE_URL = cleanUrl;
    process.env.SUPABASE_URL = cleanUrl;
    process.env.VITE_SUPABASE_ANON_KEY = cleanKey;
    process.env.SUPABASE_ANON_KEY = cleanKey;

    const store = loadStore();
    const existingInt = store.apiIntegrations.find((i: any) => i.name === 'Supabase' || i.id === 'int_supabase');
    if (existingInt) {
      existingInt.status = 'Connected';
      existingInt.keyMasked = `${cleanUrl.substring(0, 18)}...`;
      existingInt.updatedAt = new Date().toISOString();
    } else {
      store.apiIntegrations.push({
        id: 'int_supabase',
        name: 'Supabase',
        status: 'Connected',
        keyMasked: `${cleanUrl.substring(0, 18)}...`,
        updatedAt: new Date().toISOString(),
      });
    }

    saveStore(store);
    logAuditAction('Configured Supabase Credentials', 'Admin', 'Config', 'Supabase Client Integration');

    return NextResponse.json({
      success: true,
      message: 'Supabase credentials saved successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error configuring Supabase' }, { status: 500 });
  }
}
