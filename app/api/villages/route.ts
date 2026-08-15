import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';

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
    const body = await req.json();
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
    } = body;

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
      postOffice: postOffice ? postOffice.trim() : 'Bahera Rasoolpur',
      orgName: orgName ? orgName.trim() : 'Gramodaya Youth Manch',
      orgNameHindi: orgNameHindi ? orgNameHindi.trim() : 'ग्रामोदय यूथ मंच',
      sloganHindi: sloganHindi ? sloganHindi.trim() : 'युवा शक्ति • ग्राम विकास • उज्ज्वल भविष्य',
      taglineHindi: taglineHindi ? taglineHindi.trim() : 'युवा शक्ति से ग्रामोदय की ओर',
      isActive: true,
    };

    store.villages = [...(store.villages || []), newVillage];
    saveStore(store);

    logAuditAction(
      `Created Village Unit: ${newVillage.nameHindi}`,
      adminName || 'Super Admin',
      adminMobile || '',
      newVillage.name
    );

    return NextResponse.json({ success: true, village: newVillage, villages: store.villages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creating village' }, { status: 500 });
  }
}
