import { NextResponse } from 'next/server';
import { loadStore, saveStore, normalizeMobile } from '@/src/lib/serverStore';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userMobile = searchParams.get('userMobile');

  if (!userMobile) {
    return NextResponse.json({ error: 'मोबाइल नंबर आवश्यक है।' }, { status: 400 });
  }

  const userDigits = normalizeMobile(userMobile);
  if (!userDigits) {
    return NextResponse.json({ error: 'अमान्य मोबाइल नंबर।' }, { status: 400 });
  }

  const store = loadStore();
  const userMessages = (store.messages || []).filter((msg) => {
    const sDigits = normalizeMobile(msg.senderMobile || '');
    const rDigits = normalizeMobile(msg.recipientMobile || '');
    return sDigits === userDigits || rDigits === userDigits;
  });

  return NextResponse.json({ success: true, messages: userMessages });
}

export async function POST(req: Request) {
  try {
    const { senderMobile, senderName, recipientMobile, recipientName, text } = await req.json();

    if (!senderMobile || !recipientMobile || !text || !text.trim()) {
      return NextResponse.json({ error: 'प्रेषक, प्राप्तकर्ता और संदेश आवश्यक हैं।' }, { status: 400 });
    }

    const sDigits = normalizeMobile(senderMobile);
    const rDigits = normalizeMobile(recipientMobile);

    if (!sDigits || !rDigits) {
      return NextResponse.json({ error: 'मान्य मोबाइल नंबर आवश्यक हैं।' }, { status: 400 });
    }

    const store = loadStore();
    const newMessage = {
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      senderMobile: senderMobile.trim(),
      senderName: senderName || 'Member',
      recipientMobile: recipientMobile.trim(),
      recipientName: recipientName || 'Member',
      text: text.trim(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    store.messages.push(newMessage);
    saveStore(store);

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error sending message' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const userMobile = searchParams.get('userMobile');
    const isAdmin = searchParams.get('isAdmin') === 'true';

    let messageId = id;
    let senderMobile = userMobile;

    if (!messageId) {
      const body = await req.json().catch(() => ({}));
      messageId = body.id;
      senderMobile = body.userMobile;
    }

    if (!messageId) {
      return NextResponse.json({ error: 'संदेश ID आवश्यक है।' }, { status: 400 });
    }

    const store = loadStore();
    if (!store.messages) store.messages = [];

    const existing = store.messages.find((m) => String(m.id) === String(messageId));
    if (existing && !isAdmin && senderMobile) {
      const uDigits = normalizeMobile(senderMobile);
      const sDigits = normalizeMobile(existing.senderMobile || '');
      if (uDigits && sDigits && uDigits !== sDigits) {
        return NextResponse.json({ error: 'आप केवल अपने भेजे गए संदेश ही हटा सकते हैं।' }, { status: 403 });
      }
    }

    store.messages = store.messages.filter((m) => String(m.id) !== String(messageId));
    saveStore(store);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting message' }, { status: 500 });
  }
}
