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
