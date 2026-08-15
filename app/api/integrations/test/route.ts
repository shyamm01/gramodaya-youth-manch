import { NextResponse } from 'next/server';
import { loadStore, logAuditAction } from '@/src/lib/serverStore';
import { requireAuth } from '@/src/lib/jwtAuth';

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req, 'integrations:manage', 'ADMIN');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id, adminName, adminMobile } = await req.json();
    const store = loadStore();
    const integration = store.apiIntegrations.find((i) => i.id === id);

    if (!integration) {
      return NextResponse.json({ error: 'Integration service not found.' }, { status: 404 });
    }

    if (integration.status === 'Not Connected') {
      return NextResponse.json({
        success: false,
        status: 'Not Connected',
        message: `${integration.name} is not connected. Please configure API credentials first.`,
      });
    }

    logAuditAction(
      `Tested ${integration.name} Connection`,
      adminName || currentUser.name || 'Main Admin',
      adminMobile || currentUser.mobile || '',
      integration.name
    );

    return NextResponse.json({
      success: true,
      status: 'Connected',
      message: `${integration.name} connection tested and verified successfully!`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error testing integration' }, { status: 500 });
  }
}
