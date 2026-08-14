import { NextResponse } from 'next/server';
import { loadStore, saveStore } from '@/src/lib/serverStore';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const store = loadStore();
    if (!store.groupMessages) store.groupMessages = [];
    store.groupMessages = store.groupMessages.filter((m) => m.id !== id);
    saveStore(store);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting group message' }, { status: 500 });
  }
}
