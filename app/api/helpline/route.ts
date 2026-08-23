import { NextResponse } from 'next/server';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { eq, or } from 'drizzle-orm';

export async function GET() {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection is not configured.' },
        { status: 500 }
      );
    }

    const [villagesData, adminsData] = await Promise.all([
      db.query.villages.findMany({
        with: {
          gramPanchayat: {
            with: {
              district: true,
            },
          },
        },
      }),
      db
        .select()
        .from(schema.profiles)
        .where(
          or(
            eq(schema.profiles.systemRole, 'ADMIN'),
            eq(schema.profiles.systemRole, 'SUPER_ADMIN')
          )
        ),
    ]);

    const activeVillage = villagesData[0];
    const gp = activeVillage?.gramPanchayat;

    const helplineData = {
      villageInfo: {
        village: activeVillage?.name || 'Rasoolpur',
        villageHindi: activeVillage?.nameHindi || 'रसूलपुर',
        gramPanchayat: gp?.name || 'Bahera',
        district: gp?.district?.name || 'Hardoi',
        pincode: activeVillage?.pincode || '241125',
      },
      villageAdmins: adminsData.map((a: any) => ({
        id: String(a.id),
        name: a.fullName || a.name || 'Admin',
        mobile: a.mobile,
        designation: a.designation || (a.systemRole === 'SUPER_ADMIN' ? 'केंद्रीय हेल्पलाइन (Head Admin)' : 'ग्राम प्रतिनिधि'),
        role: a.systemRole,
      })),
      emergencyNumbers: [
        { service: 'पुलिस आपातकालीन (Police Emergency)', number: '112', icon: 'Shield' },
        { service: 'एम्बुलेंस सेवा (Ambulance Service)', number: '108', icon: 'Ambulance' },
        { service: 'महिला हेल्पलाइन (Women Helpline)', number: '1090', icon: 'HeartHandshake' },
        { service: 'बाल हेल्पलाइन (Childline)', number: '1098', icon: 'Baby' },
        { service: 'किसान कॉल सेंटर (Kisan Helpline)', number: '1800-180-1551', icon: 'Sprout' },
        { service: 'विद्युत शिकायत (Electricity Helpline)', number: '1912', icon: 'Zap' },
      ],
      communityHelpline: {
        title: 'ग्रामोदय सहायता केंद्र (GYM Youth Support Desk)',
        timings: 'सुबह 08:00 AM से शाम 08:00 PM (सातों दिन)',
        whatsapp: '+91 95060 72678',
        email: 'help@gramodayayouthmanch.org',
      },
    };

    return NextResponse.json({
      success: true,
      page: 'helpline',
      data: helplineData,
    });
  } catch (error: any) {
    console.error('Error fetching helpline page data:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch helpline data' },
      { status: 500 }
    );
  }
}
