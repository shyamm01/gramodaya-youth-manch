import { NextResponse } from 'next/server';
import { loadStore, saveStore } from '@/src/lib/serverStore';
import { uploadToSupabaseStorage } from '@/src/lib/supabaseStorage';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { targetType, targetId, photoUrl } = await req.json();
    if (!targetType || !targetId || !photoUrl) {
      return NextResponse.json({ error: 'Missing targetType, targetId or photoUrl' }, { status: 400 });
    }

    let finalPhotoUrl = photoUrl;

    // 1. If photo is base64, upload to Supabase Storage
    if (photoUrl.startsWith('data:')) {
      try {
        const supabaseRes = await uploadToSupabaseStorage(photoUrl, {
          bucket: 'member-photos',
          folder: 'profiles',
          filename: `${targetType}_${targetId}_${Date.now()}.jpg`,
        });

        if (supabaseRes.success && supabaseRes.publicUrl) {
          finalPhotoUrl = supabaseRes.publicUrl;
        }
      } catch (sbErr) {
        console.warn('Supabase storage upload note in /api/upload-photo:', sbErr);
      }
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
