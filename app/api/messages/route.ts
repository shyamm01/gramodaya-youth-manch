import { NextResponse } from 'next/server';
import { loadStore, saveStore, normalizeMobile } from '@/src/lib/serverStore';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userMobile = searchParams.get('userMobile');
  const isAdmin = searchParams.get('isAdmin') === 'true' || userMobile === 'ADMIN';
  const villageId = searchParams.get('villageId');

  const store = loadStore();
  const allMessages = store.messages || [];

  // If Admin request, return all messages or all helpdesk inquiries
  if (isAdmin) {
    let list = allMessages;
    if (villageId) {
      list = list.filter((m: any) => !m.villageId || String(m.villageId) === String(villageId));
    }
    return NextResponse.json({ success: true, messages: list });
  }

  if (!userMobile) {
    return NextResponse.json({ error: 'मोबाइल नंबर आवश्यक है।' }, { status: 400 });
  }

  const userDigits = normalizeMobile(userMobile);
  if (!userDigits) {
    return NextResponse.json({ error: 'अमान्य मोबाइल नंबर।' }, { status: 400 });
  }

  const userMessages = allMessages.filter((msg: any) => {
    const sDigits = normalizeMobile(msg.senderMobile || '');
    const rDigits = normalizeMobile(msg.recipientMobile || '');
    const isHelpdeskToMe = msg.recipientMobile === userMobile || (msg.senderMobile === 'ADMIN' && rDigits === userDigits);
    const isHelpdeskFromMe = msg.senderMobile === userMobile || (msg.recipientMobile === 'ADMIN' && sDigits === userDigits);
    return sDigits === userDigits || rDigits === userDigits || isHelpdeskToMe || isHelpdeskFromMe;
  });

  return NextResponse.json({ success: true, messages: userMessages });
}

export async function POST(req: Request) {
  try {
    const {
      senderMobile,
      senderName,
      senderPhoto,
      recipientMobile,
      recipientName,
      recipientPhoto,
      text,
      villageId,
      type,
    } = await req.json();

    if (!senderMobile || !recipientMobile || !text || !text.trim()) {
      return NextResponse.json({ error: 'प्रेषक, प्राप्तकर्ता और संदेश आवश्यक हैं।' }, { status: 400 });
    }

    const sDigits = senderMobile === 'ADMIN' ? 'ADMIN' : normalizeMobile(senderMobile);
    const rDigits = recipientMobile === 'ADMIN' ? 'ADMIN' : normalizeMobile(recipientMobile);

    if (!sDigits || !rDigits) {
      return NextResponse.json({ error: 'मान्य मोबाइल नंबर आवश्यक हैं।' }, { status: 400 });
    }

    const store = loadStore();
    if (!store.messages) store.messages = [];

    const newMessage = {
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      senderMobile: senderMobile.trim(),
      senderName: senderName || 'Member',
      senderPhoto: senderPhoto || '',
      recipientMobile: recipientMobile.trim(),
      recipientName: recipientName || 'Member',
      recipientPhoto: recipientPhoto || '',
      text: text.trim(),
      villageId: villageId ? String(villageId) : undefined,
      type: type || (recipientMobile === 'ADMIN' || senderMobile === 'ADMIN' ? 'helpdesk' : 'direct'),
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
    if (existing && !isAdmin && senderMobile && senderMobile !== 'ADMIN') {
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
