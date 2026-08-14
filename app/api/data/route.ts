import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';

export async function GET() {
  try {
    const store = loadStore();
    return NextResponse.json(store);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, data, adminName, adminMobile } = body;

    const store = loadStore();

    if (action === 'reset') {
      store.members = [];
      store.complaints = [];
      store.socialWorks = [];
      store.publicInfos = [];
      store.events = [];
      store.gallery = [];
      store.elders = [];
      store.messages = [];
      store.groupMessages = [];
      saveStore(store);

      logAuditAction(
        'System Data Reset',
        adminName || 'Main Admin',
        adminMobile || '',
        'Entire Database Store'
      );

      return NextResponse.json({ success: true, message: 'डेटा सफलतापूर्वक रीसेट किया गया।' });
    }

    if (action === 'import' && data) {
      if (Array.isArray(data.members)) store.members = data.members;
      if (Array.isArray(data.complaints)) store.complaints = data.complaints;
      if (Array.isArray(data.socialWorks)) store.socialWorks = data.socialWorks;
      if (Array.isArray(data.publicInfos)) store.publicInfos = data.publicInfos;
      if (Array.isArray(data.announcements)) store.announcements = data.announcements;
      if (Array.isArray(data.events)) store.events = data.events;
      if (Array.isArray(data.gallery)) store.gallery = data.gallery;
      if (Array.isArray(data.elders)) store.elders = data.elders;
      if (Array.isArray(data.groupMessages)) store.groupMessages = data.groupMessages;

      saveStore(store);
      logAuditAction(
        'Imported Database Backup',
        adminName || 'Main Admin',
        adminMobile || '',
        'Database JSON Import'
      );

      return NextResponse.json({ success: true, message: 'डेटा बैकअप सफलतापूर्वक आयात किया गया।' });
    }

    if (action === 'update-settings' && data) {
      store.villageSettings = {
        ...store.villageSettings,
        ...data,
      };
      saveStore(store);
      logAuditAction(
        'Updated Village & Portal Settings',
        adminName || 'Main Admin',
        adminMobile || '',
        'Village Portal Settings'
      );
      return NextResponse.json({ success: true, villageSettings: store.villageSettings });
    }

    if (action === 'add-village' && data) {
      const newVillage = {
        id: data.id || `vil_${Date.now()}`,
        slug: data.slug || `vil-${Date.now()}`,
        name: data.name || 'New Village',
        nameHindi: data.nameHindi || 'नया ग्राम',
        gramPanchayatName: data.gramPanchayatName || '',
        gramPanchayatNameHindi: data.gramPanchayatNameHindi || '',
        districtName: data.districtName || 'Jaunpur',
        orgName: data.orgName || 'Gramodaya Youth Manch',
        orgNameHindi: data.orgNameHindi || 'ग्रामोदय यूथ मंच',
        sloganHindi: data.sloganHindi || 'युवा शक्ति • ग्राम विकास • उज्ज्वल भविष्य',
        taglineHindi: data.taglineHindi || 'युवा शक्ति से ग्रामोदय की ओर',
        isActive: true,
      };

      store.villages = [...(store.villages || []), newVillage];
      saveStore(store);
      logAuditAction(
        `Added New Village Unit: ${newVillage.nameHindi}`,
        adminName || 'Super Admin',
        adminMobile || '',
        'Villages Directory'
      );
      return NextResponse.json({ success: true, village: newVillage, villages: store.villages });
    }

    if (action === 'set-user-permission' && data) {
      const { userId, permissionCode, isGranted, scopeType, scopeId } = data;
      const filtered = (store.userPermissions || []).filter(
        (p) => !(p.userId === userId && p.permissionCode === permissionCode)
      );

      const updatedPerms = [
        ...filtered,
        {
          id: `uperm_${Date.now()}`,
          userId,
          permissionCode,
          scopeType: scopeType || 'VILLAGE',
          scopeId: scopeId || null,
          isGranted: isGranted !== false,
          grantedBy: adminName || 'Admin',
          createdAt: new Date().toISOString(),
        },
      ];

      store.userPermissions = updatedPerms;
      saveStore(store);
      logAuditAction(
        `Updated User Permission: ${permissionCode} for User ${userId}`,
        adminName || 'Admin',
        adminMobile || '',
        'User Permissions (PBAC)'
      );
      return NextResponse.json({ success: true, userPermissions: store.userPermissions });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error processing request' }, { status: 500 });
  }
}
