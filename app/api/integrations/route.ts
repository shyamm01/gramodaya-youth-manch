import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';
import { requireAuth } from '@/src/lib/jwtAuth';

export async function GET() {
  const store = loadStore();
  return NextResponse.json({ success: true, apiIntegrations: store.apiIntegrations });
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req, 'integrations:manage', 'SUPER_ADMIN');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id, name, config, adminName, adminMobile } = await req.json();
    const store = loadStore();
    const integration = store.apiIntegrations.find((i) => i.id === id);

    if (!integration) {
      return NextResponse.json({ error: 'Integration service not found.' }, { status: 404 });
    }

    integration.status = 'Connected';
    integration.keyMasked = config?.apiKey ? `${config.apiKey.substring(0, 6)}••••••••` : 'Configured';
    integration.updatedAt = new Date().toISOString();

    saveStore(store);
    logAuditAction(
      `Configured ${integration.name}`,
      adminName || currentUser.name || 'Main Admin',
      adminMobile || currentUser.mobile || '',
      integration.name
    );

    return NextResponse.json({ success: true, integration });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating integration' }, { status: 500 });
  }
}
