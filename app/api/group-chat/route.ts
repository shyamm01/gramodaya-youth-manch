import { NextResponse } from 'next/server';
import { loadStore, saveStore } from '@/src/lib/serverStore';

export async function GET() {
  const store = loadStore();
  if (!store.groupMessages) {
    store.groupMessages = [];
  }

  const onlineMembers = [
    ...store.admins.map((a) => ({
      id: a.id,
      name: a.name,
      mobile: a.mobile,
      photoUrl: a.photoUrl || '',
      role: a.role || 'Admin',
      isOnline: true,
      statusBadge: 'THIS ONLINE',
    })),
    ...store.members
      .filter((m) => m.status === 'active')
      .map((m) => ({
        id: m.id,
        name: m.name,
        mobile: m.mobile,
        photoUrl: m.photoUrl || '',
        role: 'सदस्य (Member)',
        isOnline: true,
        statusBadge: 'THIS ONLINE',
      })),
  ];

  return NextResponse.json({
    success: true,
    groupMessages: store.groupMessages,
    onlineMembers,
  });
}

export async function POST(req: Request) {
  try {
    const { senderName, senderMobile, senderPhoto, text } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'संदेश आवश्यक है।' }, { status: 400 });
    }

    const store = loadStore();
    if (!store.groupMessages) {
      store.groupMessages = [];
    }

    const newMsg = {
      id: `gmsg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      senderName: (senderName && senderName.trim()) ? senderName.trim() : 'ग्रामोदय सदस्य',
      senderMobile: senderMobile ? senderMobile.trim() : '',
      senderPhoto: senderPhoto || '',
      text: text.trim(),
      createdAt: new Date().toISOString(),
      isOnline: true,
    };

    store.groupMessages.push(newMsg);
    saveStore(store);

    return NextResponse.json({ success: true, message: newMsg, groupMessages: store.groupMessages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error sending group message' }, { status: 500 });
  }
}
