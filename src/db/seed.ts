import { getDb } from './index';
import {
  states,
  districts,
  gramPanchayats,
  villages,
  modules,
  profiles,
  announcements,
  complaints,
  socialWorks,
  events,
  gallery,
  elders,
  publicInfos,
  chatRooms,
} from './schema';
import { seedEducationContent } from './seedEducation';
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

    // 5. Seed Canonical System Modules
    console.log('Seeding Canonical System Modules...');
    const CANONICAL_MODULES = [
      { slug: 'village', name: 'Village Management', nameHindi: 'ग्राम प्रबंधन', icon: 'Building2', description: 'मल्टी-विलेज प्रबंधन एवं क्षेत्रीय शाखाएं', displayOrder: 1 },
      { slug: 'members', name: 'Members & Approvals', nameHindi: 'सदस्यता एवं अनुमोदन', icon: 'Users', description: 'सदस्य निर्देशिका, सत्यापन व सदस्यता भूमिकाएं', displayOrder: 2 },
      { slug: 'complaints', name: 'Complaints & Grievances', nameHindi: 'जन समस्या एवं शिकायत निवारण', icon: 'AlertCircle', description: 'ग्राम स्तर की समस्याएं एवं निवारण स्थिति', displayOrder: 3 },
      { slug: 'social_works', name: 'Social Development Works', nameHindi: 'सामाजिक विकास कार्य', icon: 'HeartHandshake', description: 'ग्राम विकास एवं सामाजिक कल्याण पहल', displayOrder: 4 },
      { slug: 'events', name: 'Village Events', nameHindi: 'ग्राम कार्यक्रम व सभाएं', icon: 'Calendar', description: 'सामुदायिक बैठकें व उत्सव आयोजन', displayOrder: 5 },
      { slug: 'gallery', name: 'Media Gallery', nameHindi: 'चित्रशाला एवं मीडिया', icon: 'Image', description: 'ग्रामोदय गतिविधियों का फोटो संग्रह', displayOrder: 6 },
      { slug: 'announcements', name: 'Announcements & Alerts', nameHindi: 'सूचना एवं प्रसारण', icon: 'Megaphone', description: 'आधिकारिक सूचनाएं, अलर्ट व मुनादी', displayOrder: 7 },
      { slug: 'public_info', name: 'Public Information Board', nameHindi: 'सार्वजनिक सूचना पट्ट', icon: 'FileText', description: 'पारदर्शिता व जनकल्याणकारी सूचनाएं', displayOrder: 8 },
      { slug: 'elders', name: 'Elder Care & Respect', nameHindi: 'बुजुर्ग सम्मान एवं देखरेख', icon: 'UserCheck', description: 'वरिष्ठ नागरिकों की सूची व सहयोग', displayOrder: 9 },
      { slug: 'education', name: 'Education & Career Guidance', nameHindi: 'शिक्षा एवं मार्गदर्शन', icon: 'GraduationCap', description: 'छात्रवृत्ति, सरकारी योजनाएं व कॅरियर सलाह', displayOrder: 10 },
      { slug: 'chat', name: 'Community Live Chat', nameHindi: 'सामुदायिक लाइव चैट', icon: 'MessageSquare', description: 'ग्राम सदस्यों के बीच सीधा संवाद', displayOrder: 11 },
      { slug: 'audit', name: 'Audit & Activity Logs', nameHindi: 'ऑडिट एवं गतिविधि लॉग्स', icon: 'Activity', description: 'सुरक्षा, गतिविधि ट्रैकिंग व सिस्टम लॉग्स', displayOrder: 12 },
      { slug: 'settings', name: 'Settings & Permissions Matrix', nameHindi: 'सिस्टम सेटिंग्स व अनुमतियां', icon: 'Settings', description: 'उपयोगकर्ता अनुमतियां व सिस्टम विन्यास', displayOrder: 13 },
    ];

    for (const mod of CANONICAL_MODULES) {
      await db
        .insert(modules)
        .values({
          slug: mod.slug,
          name: mod.name,
          nameHindi: mod.nameHindi,
          icon: mod.icon,
          description: mod.description,
          displayOrder: mod.displayOrder,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: modules.slug,
          set: {
            name: mod.name,
            nameHindi: mod.nameHindi,
            icon: mod.icon,
            description: mod.description,
            displayOrder: mod.displayOrder,
            updatedAt: new Date(),
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

    // 6. Profiles are not seeded automatically; real accounts are created via Supabase Auth signup.

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
          date: (item as any).date || new Date().toISOString().split('T')[0],
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

    // 15. Seed Education Module (platform-wide categories & schemes)
    console.log('Seeding education categories and schemes...');
    await seedEducationContent();

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
