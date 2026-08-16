import { getDb } from './index';
import {
  states,
  districts,
  gramPanchayats,
  villages,
  permissions,
  members,
  announcements,
  complaints,
  socialWorks,
  events,
  gallery,
  elders,
  publicInfos,
  chatRooms,
} from './schema';
import { loadStore } from '../lib/serverStore';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  console.log('Seeding PostgreSQL database with normalized 3NF schema...');
  const db = getDb();
  if (!db) {
    throw new Error('Database connection is not configured.');
  }

  const store = loadStore();

  try {
    // 1. Seed State (Uttar Pradesh)
    console.log('Seeding State: Uttar Pradesh...');
    const [state] = await db
      .insert(states)
      .values({
        name: 'Uttar Pradesh',
        nameHindi: 'उत्तर प्रदेश',
        code: 'UP',
      })
      .onConflictDoUpdate({
        target: states.code,
        set: { name: 'Uttar Pradesh', nameHindi: 'उत्तर प्रदेश' },
      })
      .returning();

    const stateId = state.id;

    // 2. Seed District (Hardoi)
    console.log('Seeding District: Hardoi...');
    const existingDistrict = await db
      .select()
      .from(districts)
      .where(eq(districts.name, 'Hardoi'))
      .limit(1);

    let districtId = existingDistrict[0]?.id;
    if (!districtId) {
      const [dist] = await db
        .insert(districts)
        .values({
          stateId,
          name: 'Hardoi',
          nameHindi: 'हरदोई',
        })
        .returning();
      districtId = dist.id;
    }

    // 3. Seed Gram Panchayat (Bahera)
    console.log('Seeding Gram Panchayat: Bahera...');
    const existingGp = await db
      .select()
      .from(gramPanchayats)
      .where(eq(gramPanchayats.name, 'Bahera'))
      .limit(1);

    let gramPanchayatId = existingGp[0]?.id;
    if (!gramPanchayatId) {
      const [gp] = await db
        .insert(gramPanchayats)
        .values({
          districtId,
          name: 'Bahera',
          nameHindi: 'बहेरा',
          blockName: 'Hardoi',
          blockNameHindi: 'हरदोई',
          pincode: '241125',
          postOffice: 'Bahera Rasoolpur',
          isActive: true,
        })
        .returning();
      gramPanchayatId = gp.id;
    }

    // 4. Seed Village (Rasoolpur)
    console.log('Seeding Village: Rasoolpur...');
    const [village] = await db
      .insert(villages)
      .values({
        slug: 'rasoolpur',
        name: 'RASOOLPUR',
        nameHindi: 'रसूलपुर',
        gramPanchayatId,
        blockName: 'Hardoi',
        blockNameHindi: 'हरदोई',
        pincode: '241125',
        postOffice: 'Bahera Rasoolpur',
        orgName: 'GRAMODAYA YOUTH MANCH',
        orgNameHindi: '🌱 ग्रामोदय यूथ मंच 🌱',
        sloganHindi: 'युवा शक्ति से ग्रामोदय की ओर।',
        taglineHindi: 'युवा शक्ति • ग्राम विकास • उज्ज्वल भविष्य',
        orgPurposeHindi:
          'ग्रामोदय यूथ मंच गांव के युवाओं, परिवारों और बुजुर्गों को एक साथ जोड़कर ग्राम विकास, शिक्षा, रोजगार, स्वच्छता, पर्यावरण, सामाजिक जागरूकता और जरूरतमंद लोगों की सहायता के लिए कार्य करने का एक सामुदायिक मंच है।',
        isActive: true,
      })
      .onConflictDoUpdate({
        target: villages.slug,
        set: {
          name: 'RASOOLPUR',
          nameHindi: 'रसूलपुर',
          gramPanchayatId,
          blockName: 'Hardoi',
          blockNameHindi: 'हरदोई',
          pincode: '241125',
          postOffice: 'Bahera Rasoolpur',
          orgName: 'GRAMODAYA YOUTH MANCH',
          orgNameHindi: '🌱 ग्रामोदय यूथ मंच 🌱',
        },
      })
      .returning();

    const villageId = village.id;

    // 5. Seed Core Permissions
    console.log('Seeding Canonical Permissions...');
    const CORE_PERMISSIONS = [
      { code: 'dashboard:view', name: 'डैशबोर्ड दृश्य', module: 'dashboard', description: 'मुख्य डैशबोर्ड आँकड़े देखने की अनुमति' },
      { code: 'complaints:view', name: 'शिकायतें देखें', module: 'complaints', description: 'ग्राम शिकायतों को देखने की अनुमति' },
      { code: 'complaints:update_status', name: 'शिकायत स्थिति बदलें', module: 'complaints', description: 'शिकायतों की स्थिति अपडेट करने की अनुमति' },
      { code: 'members:view', name: 'सदस्य देखें', module: 'members', description: 'ग्राम सदस्यों की सूची देखने की अनुमति' },
      { code: 'members:approve', name: 'सदस्य स्वीकृति', module: 'members', description: 'लंबित सदस्यों को स्वीकृत करने की अनुमति' },
      { code: 'social_work:create', name: 'सामाजिक कार्य जोड़ें', module: 'social_work', description: 'नए सामाजिक कार्यों को पोस्ट करने की अनुमति' },
      { code: 'events:create', name: 'कार्यक्रम बनाएं', module: 'events', description: 'ग्राम कार्यक्रमों को प्रकाशित करने की अनुमति' },
      { code: 'gallery:upload', name: 'चित्र अपलोड', module: 'gallery', description: 'चित्रशाला में नई तस्वीरें जोड़ने की अनुमति' },
      { code: 'announcements:create', name: 'सूचना बनाएं', module: 'announcements', description: 'आधिकारिक सूचनाएं और अलर्ट जारी करने की अनुमति' },
      { code: 'elders:create', name: 'बुजुर्ग सूची प्रबंधन', module: 'elders', description: 'बुजुर्ग सम्मान सूची में नाम जोड़ने की अनुमति' },
    ];

    for (const perm of CORE_PERMISSIONS) {
      await db
        .insert(permissions)
        .values({
          code: perm.code,
          name: perm.name,
          module: perm.module,
          description: perm.description,
        })
        .onConflictDoUpdate({
          target: permissions.code,
          set: {
            name: perm.name,
            module: perm.module,
            description: perm.description,
          },
        });
    }

    // 5.1 Seed Default Chat Room (General Discussion)
    await db
      .insert(chatRooms)
      .values({
        id: 'general',
        name: 'General Discussion',
        type: 'group',
        villageId,
      })
      .onConflictDoNothing();

    // 6. Seed Admins
    console.log(`Inserting ${store.admins.length} admins...`);
    for (const admin of store.admins) {
      await db
        .insert(members)
        .values({
          villageId,
          name: admin.name,
          mobile: admin.mobile,
          role: 'ADMIN',
          systemRole: admin.isHead ? 'SUPER_ADMIN' : 'ADMIN',
          status: 'active',
          photoUrl: admin.photoUrl || null,
          address: `${admin.village || 'Rasoolpur'}, ग्राम पंचायत ${admin.gramPanchayat || 'Bahera'}`,
        })
        .onConflictDoUpdate({
          target: members.mobile,
          set: {
            name: admin.name,
            photoUrl: admin.photoUrl || null,
            systemRole: admin.isHead ? 'SUPER_ADMIN' : 'ADMIN',
          },
        });
    }

    // 7. Seed Members
    console.log(`Inserting ${store.members.length} members...`);
    for (const member of store.members) {
      await db
        .insert(members)
        .values({
          villageId,
          name: member.name,
          mobile: member.mobile,
          role: 'MEMBER',
          systemRole: 'MEMBER',
          status: member.status,
          address: member.address || 'ग्राम रसूलपुर, ग्राम पंचायत बहेरा',
        })
        .onConflictDoNothing();
    }

    // 8. Seed Announcements
    console.log(`Inserting ${store.announcements.length} announcements...`);
    for (const ann of store.announcements) {
      await db
        .insert(announcements)
        .values({
          villageId,
          title: ann.title,
          content: ann.content,
          publishedBy: ann.publishedBy || 'ग्रामोदय यूथ मंच',
          isUrgent: (ann as any).isUrgent || false,
          date: ann.date || new Date().toISOString().split('T')[0],
        })
        .onConflictDoNothing();
    }

    // 9. Seed Complaints
    console.log(`Inserting ${store.complaints.length} complaints...`);
    for (const comp of store.complaints) {
      await db
        .insert(complaints)
        .values({
          villageId,
          title: comp.title,
          category: (comp.category as any) || 'Other',
          description: comp.description,
          location: comp.location || 'Rasoolpur',
          reporterName: comp.reporterName || 'Resident',
          reporterMobile: comp.reporterMobile || '+91 99999 99999',
          status: comp.status || 'NEW',
          photoUrl: comp.photoUrl || null,
        })
        .onConflictDoNothing();
    }

    // 10. Seed Social Works
    console.log(`Inserting ${store.socialWorks.length} social works...`);
    for (const sw of store.socialWorks) {
      await db
        .insert(socialWorks)
        .values({
          villageId,
          title: sw.title,
          description: sw.description,
          date: sw.date || new Date().toISOString().split('T')[0],
          location: sw.location || 'Rasoolpur',
          submitterName: sw.submitterName || 'GYM Volunteer',
          submitterMobile: sw.submitterMobile || '+91 99999 99999',
          status: sw.status || 'published',
          photoUrl: sw.photoUrl || null,
        })
        .onConflictDoNothing();
    }

    // 11. Seed Events
    console.log(`Inserting ${store.events.length} events...`);
    for (const ev of store.events) {
      await db
        .insert(events)
        .values({
          villageId,
          title: ev.title,
          description: ev.description || '',
          date: ev.date,
          time: ev.time || '10:00 AM',
          location: ev.location || 'Rasoolpur Village',
          photoUrl: ev.photoUrl || null,
          status: (ev.status as any) || 'PUBLISHED',
        })
        .onConflictDoNothing();
    }

    // 12. Seed Gallery
    console.log(`Inserting ${store.gallery.length} gallery items...`);
    for (const item of store.gallery) {
      await db
        .insert(gallery)
        .values({
          villageId,
          caption: item.caption || '',
          photoUrl: item.photoUrl,
          uploadedBy: item.uploadedBy || 'Admin',
          status: item.status || 'published',
        })
        .onConflictDoNothing();
    }

    // 13. Seed Elders
    console.log(`Inserting ${store.elders.length} elders...`);
    for (const elder of store.elders) {
      await db
        .insert(elders)
        .values({
          villageId,
          name: elder.name,
          age: (elder as any).age || '75',
          role: (elder as any).role || 'Senior Elder',
          contribution: (elder as any).contribution || 'Village Elder & Guide',
          photoUrl: elder.photoUrl || null,
        })
        .onConflictDoNothing();
    }

    // 14. Seed Public Infos
    console.log(`Inserting ${store.publicInfos.length} public infos...`);
    for (const pi of store.publicInfos) {
      await db
        .insert(publicInfos)
        .values({
          villageId,
          title: (pi as any).title,
          description: (pi as any).description,
          category: (pi as any).category || 'General',
          submitterName: (pi as any).submitterName || 'Community Desk',
          submitterMobile: (pi as any).submitterMobile || '+91 99999 99999',
          status: (pi.status as any) || 'approved',
        })
        .onConflictDoNothing();
    }

    console.log('Seeding completed successfully! All entities populated with normalized relations.');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Allow direct execution: bun src/db/seed.ts
if (import.meta.main || process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase()
    .then(() => {
      console.log('Seed runner finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed runner failed:', err);
      process.exit(1);
    });
}
