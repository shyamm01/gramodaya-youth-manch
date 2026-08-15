import { NextResponse } from 'next/server';
import { loadStore, saveStore } from '@/src/lib/serverStore';
import { ensureSupabaseUrl } from '@/src/lib/supabaseStorage';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { targetType, targetId, photoUrl } = await req.json();
    if (!targetType || !targetId || !photoUrl) {
      return NextResponse.json({ error: 'Missing targetType, targetId or photoUrl' }, { status: 400 });
    }

    // 1. Resolve photo to Supabase Storage public CDN URL
    const finalPhotoUrl = await ensureSupabaseUrl(photoUrl, 'profiles', `${targetType}_${targetId}`);

    if (!finalPhotoUrl || finalPhotoUrl.startsWith('data:')) {
      return NextResponse.json({
        error: 'Failed to obtain public CDN URL from Supabase Storage. Binary data was not stored.',
      }, { status: 500 });
    }

    // 2. Update In-Memory / File Store with public CDN URL
    const store = loadStore();
    if (targetType === 'admin') {
      store.admins = store.admins.map((a) => (a.id === targetId ? { ...a, photoUrl: finalPhotoUrl } : a));
    } else if (targetType === 'member') {
      store.members = store.members.map((m) => (m.id === targetId ? { ...m, photoUrl: finalPhotoUrl } : m));
    }
    saveStore(store);

    // 3. Update PostgreSQL Database (Drizzle) with public CDN URL
    try {
      const db = getDb();
      if (db) {
        const numId = Number(targetId);
        if (!isNaN(numId)) {
          await db.update(schema.members).set({ photoUrl: finalPhotoUrl }).where(eq(schema.members.id, numId));
        }
      }
    } catch (dbErr) {
      console.warn('DB update note in /api/upload-photo:', dbErr);
    }

    return NextResponse.json({ success: true, photoUrl: finalPhotoUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error uploading photo' }, { status: 500 });
  }
}
