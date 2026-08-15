import { validateRequestBody, villageCreateSchema } from '@/src/lib/validations';
import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';
import { requireAuth } from '@/src/lib/jwtAuth';

export async function GET() {
  try {
    const store = loadStore();
    return NextResponse.json({ success: true, villages: store.villages || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching villages' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req, 'village:manage', 'ADMIN');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const validation = await validateRequestBody(req, villageCreateSchema);
    if (!validation.success) {
      return validation.response;
    }
    const {
      name,
      nameHindi,
      gramPanchayatName,
      gramPanchayatNameHindi,
      districtName,
      districtNameHindi,
      stateName,
      stateNameHindi,
      blockName,
      blockNameHindi,
      pincode,
      postOffice,
      orgName,
      orgNameHindi,
      sloganHindi,
      taglineHindi,
      adminName,
      adminMobile,
    } = validation.data;

    if (!name || !nameHindi) {
      return NextResponse.json({ error: 'Village name in English and Hindi is required.' }, { status: 400 });
    }

    const store = loadStore();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newVillage = {
      id: `vil_${Date.now()}`,
      slug: slug || `vil-${Date.now()}`,
      name: name.trim(),
      nameHindi: nameHindi.trim(),
      gramPanchayatName: gramPanchayatName ? gramPanchayatName.trim() : '',
      gramPanchayatNameHindi: gramPanchayatNameHindi ? gramPanchayatNameHindi.trim() : '',
      districtName: districtName ? districtName.trim() : 'Hardoi',
      districtNameHindi: districtNameHindi ? districtNameHindi.trim() : 'हरदोई',
      stateName: stateName ? stateName.trim() : 'Uttar Pradesh',
      stateNameHindi: stateNameHindi ? stateNameHindi.trim() : 'उत्तर प्रदेश',
      blockName: blockName ? blockName.trim() : 'Hardoi',
      blockNameHindi: blockNameHindi ? blockNameHindi.trim() : 'हरदोई',
      pincode: pincode ? pincode.trim() : '241125',
      postOffice: postOffice ? postOffice.trim() : 'Bahera',
      orgName: orgName ? orgName.trim() : `Gramodaya Youth Manch ${name}`,
      orgNameHindi: orgNameHindi ? orgNameHindi.trim() : `ग्रामोदय यूथ मंच ${nameHindi}`,
      sloganHindi: sloganHindi ? sloganHindi.trim() : 'सशक्त युवा, समर्थ ग्राम',
      taglineHindi: taglineHindi ? taglineHindi.trim() : 'एक कदम समग्र ग्राम विकास की ओर',
      isActive: true,
    };

    if (!store.villages) store.villages = [];
    store.villages.push(newVillage);
    saveStore(store);

    logAuditAction(
      `Added New Village: ${newVillage.nameHindi} (${newVillage.name})`,
      adminName || currentUser.name || 'Admin',
      adminMobile || currentUser.mobile || '',
      newVillage.nameHindi
    );

    return NextResponse.json({ success: true, village: newVillage });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creating village' }, { status: 500 });
  }
}
