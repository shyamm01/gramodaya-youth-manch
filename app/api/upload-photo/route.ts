import { NextResponse } from 'next/server';
import { loadStore, saveStore } from '@/src/lib/serverStore';
import { ensureSupabaseUrl, deleteSupabaseObjectByUrl } from '@/src/lib/supabaseStorage';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { targetType, targetId, photoUrl } = await req.json();
    if (!targetType || !targetId || !photoUrl) {
      return NextResponse.json({ error: 'Missing targetType, targetId or photoUrl' }, { status: 400 });
    }

    const db = getDb();
    let oldPhotoUrl: string | null = null;

    // Fetch existing photo URL to auto-clean old file
    if (db && targetType === 'member') {
      const numId = Number(targetId);
      if (!isNaN(numId)) {
        const existing = await db.query.members.findFirst({
          where: eq(schema.members.id, numId),
          columns: { photoUrl: true },
        });
        oldPhotoUrl = existing?.photoUrl || null;
      }
    }

    // 1. Resolve photo to Supabase Storage public CDN URL with auto-cleanup of old photo
    const finalPhotoUrl = await ensureSupabaseUrl(
      photoUrl,
      'profiles',
      `${targetType}_${targetId}`,
      oldPhotoUrl
    );

    if (!finalPhotoUrl || finalPhotoUrl.startsWith('data:')) {
      return NextResponse.json({
        error: 'Failed to obtain public CDN URL from Supabase Storage.',
      }, { status: 500 });
    }

    // 2. Update In-Memory / File Store
    const store = loadStore();
    if (targetType === 'admin') {
      store.admins = store.admins.map((a) => (a.id === targetId ? { ...a, photoUrl: finalPhotoUrl } : a));
    } else if (targetType === 'member') {
      store.members = store.members.map((m) => (m.id === targetId ? { ...m, photoUrl: finalPhotoUrl } : m));
    }
    saveStore(store);

    // 3. Update PostgreSQL Database (Drizzle)
    if (db && targetType === 'member') {
      const numId = Number(targetId);
      if (!isNaN(numId)) {
        await db.update(schema.members).set({ photoUrl: finalPhotoUrl }).where(eq(schema.members.id, numId));
      }
    }

    return NextResponse.json({ success: true, photoUrl: finalPhotoUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error uploading photo' }, { status: 500 });
  }
}
