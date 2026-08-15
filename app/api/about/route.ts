import { NextResponse } from 'next/server';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { desc, count } from 'drizzle-orm';

export async function GET() {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection is not configured.' },
        { status: 500 }
      );
    }

    const [villagesData, membersData, socialWorksData] = await Promise.all([
      db.query.villages.findMany({
        with: {
          gramPanchayat: {
            with: {
              district: {
                with: {
                  state: true,
                },
              },
            },
          },
        },
      }),
      db.select().from(schema.members),
      db.select().from(schema.socialWorks),
    ]);

    const activeVillage = villagesData[0];
    const gp = activeVillage?.gramPanchayat;
    const dist = gp?.district;

    const aboutInfo = {
      orgName: activeVillage?.orgName || 'Gramodaya Youth Manch',
      orgNameHindi: activeVillage?.orgNameHindi || 'ग्रामोदय यूथ मंच',
      sloganHindi: activeVillage?.sloganHindi || 'युवा शक्ति • ग्राम विकास • उज्ज्वल भविष्य',
      taglineHindi: activeVillage?.taglineHindi || 'युवा शक्ति से ग्रामोदय की ओर',
      purposeHindi:
        activeVillage?.orgPurposeHindi ||
        'ग्रामोदय यूथ मंच गांव के युवाओं, परिवारों और बुजुर्गों को एक साथ जोड़कर ग्राम विकास, शिक्षा, रोजगार, स्वच्छता, पर्यावरण, सामाजिक जागरूकता और जरूरतमंद लोगों की सहायता के लिए कार्य करने का एक सामुदायिक मंच है।',
      headquarters: `${activeVillage?.name || 'Rasoolpur'}, ग्राम पंचायत ${gp?.name || 'Bahera'}, जिला ${dist?.name || 'Hardoi'}, उत्तर प्रदेश - ${activeVillage?.pincode || '241125'}`,
      missionPoints: [
        'ग्रामीण युवाओं को संगठित कर गांव के विकास में भागीदार बनाना',
        'शिक्षा, स्वास्थ्य, स्वच्छता और पर्यावरण संरक्षण के लिए निरंतर अभियान चलाना',
        'गांव के बुजुर्गों का सम्मान और जरूरतमंद परिवारों की निस्वार्थ सहायता',
        'पारदर्शी डिजिटल मंच द्वारा ग्राम समस्याओं का त्वरित समाधान',
      ],
      corePillars: [
        { title: 'युवा नेतृत्व (Youth Empowerment)', desc: 'गांव के हर युवा को मंच और नेतृत्व का अवसर' },
        { title: 'स्वच्छ एवं हरित ग्राम (Green Village)', desc: 'पर्यावरण संरक्षण, वृक्षारोपण एवं स्वच्छता अभियान' },
        { title: 'सामाजिक सेवा (Social Welfare)', desc: 'रक्तदान, स्वास्थ्य शिविर एवं बुजुर्गों का सम्मान' },
        { title: 'डिजिटल सशक्तिकरण (Digital Governance)', desc: 'डिजिटल आईडी कार्ड एवं ऑनलाइन शिकायत निवारण' },
      ],
      stats: {
        totalYouthRegistered: membersData.length,
        activeChapters: villagesData.length,
        completedProjects: socialWorksData.length,
      },
      chapters: villagesData.map((v) => ({
        id: String(v.id),
        name: v.name,
        nameHindi: v.nameHindi,
        gramPanchayat: v.gramPanchayat?.name || 'Bahera',
        district: v.gramPanchayat?.district?.name || 'Hardoi',
      })),
    };

    return NextResponse.json({ success: true, page: 'about', data: aboutInfo });
  } catch (error: any) {
    console.error('Error fetching about page data:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch about page data' },
      { status: 500 }
    );
  }
}
