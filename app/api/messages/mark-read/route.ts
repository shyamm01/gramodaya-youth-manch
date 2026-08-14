import { NextResponse } from 'next/server';
import { loadStore, saveStore, normalizeMobile } from '@/src/lib/serverStore';

export async function POST(req: Request) {
  try {
    const { userMobile, partnerMobile } = await req.json();

    if (!userMobile || !partnerMobile) {
      return NextResponse.json({ error: 'userMobile and partnerMobile are required.' }, { status: 400 });
    }

    const uDigits = normalizeMobile(userMobile);
    const pDigits = normalizeMobile(partnerMobile);

    const store = loadStore();
    let updated = false;
    (store.messages || []).forEach((msg) => {
      const sDigits = normalizeMobile(msg.senderMobile);
      const rDigits = normalizeMobile(msg.recipientMobile);
      if (sDigits === pDigits && rDigits === uDigits && !msg.read) {
        msg.read = true;
        updated = true;
      }
    });

    if (updated) {
      saveStore(store);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error marking read' }, { status: 500 });
  }
}
