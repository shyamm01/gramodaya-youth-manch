import { NextResponse } from 'next/server';
import { loadStore, saveStore } from '@/src/lib/serverStore';

export async function POST(req: Request) {
  try {
    const { targetType, targetId, photoUrl } = await req.json();
    if (!targetType || !targetId || !photoUrl) {
      return NextResponse.json({ error: 'Missing targetType, targetId or photoUrl' }, { status: 400 });
    }

    const store = loadStore();
    if (targetType === 'admin') {
      store.admins = store.admins.map((a) => (a.id === targetId ? { ...a, photoUrl } : a));
    } else if (targetType === 'member') {
      store.members = store.members.map((m) => (m.id === targetId ? { ...m, photoUrl } : m));
    }
    saveStore(store);

    return NextResponse.json({ success: true, photoUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error uploading photo' }, { status: 500 });
  }
}
