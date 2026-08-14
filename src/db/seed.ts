import { getDb } from './index';
import {
  states,
  districts,
  gramPanchayats,
  villages,
  permissions,
  members,
  announcements,
} from './schema';
import { ALL_SYSTEM_PERMISSIONS } from '../lib/permissions';
import { loadStore } from '../lib/serverStore';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log('🌱 Starting Drizzle multi-tenant database seeding...');
  const db = getDb();

  if (!db) {
    console.error('❌ Database connection not configured. Please set DATABASE_URL in .env');
    process.exit(1);
  }

  try {
    const store = loadStore();

    // 1. Seed State
    console.log('Inserting default state (Uttar Pradesh)...');
    await db
      .insert(states)
      .values({
        id: 'state_up',
        name: 'Uttar Pradesh',
        nameHindi: 'उत्तर प्रदेश',
        code: 'UP',
      })
      .onConflictDoNothing();

    // 2. Seed District
    console.log('Inserting default district (Jaunpur)...');
    await db
      .insert(districts)
      .values({
        id: 'dist_jaunpur',
        stateId: 'state_up',
        name: 'Jaunpur',
        nameHindi: 'जौनपुर',
      })
      .onConflictDoNothing();

    // 3. Seed Gram Panchayat
    console.log('Inserting default gram panchayat (Bahera)...');
    await db
      .insert(gramPanchayats)
      .values({
        id: 'gp_bahera',
        districtId: 'dist_jaunpur',
        name: 'Bahera',
        nameHindi: 'बहेरा',
      })
      .onConflictDoNothing();

    // 4. Seed Primary Village
    console.log('Inserting primary village (Rasoolpur)...');
    await db
      .insert(villages)
      .values({
        id: 'vil_rasoolpur',
        slug: 'rasoolpur',
        name: store.villageSettings?.name || 'Rasoolpur',
        nameHindi: store.villageSettings?.nameHindi || 'रसूलपुर',
        gramPanchayatId: 'gp_bahera',
        districtId: 'dist_jaunpur',
        stateId: 'state_up',
        orgName: store.villageSettings?.orgName || 'Gramodaya Youth Manch',
        orgNameHindi: store.villageSettings?.orgNameHindi || 'ग्रामोदय यूथ मंच',
        sloganHindi: store.villageSettings?.sloganHindi || 'युवा शक्ति • ग्राम विकास • उज्ज्वल भविष्य',
        taglineHindi: store.villageSettings?.taglineHindi || 'युवा शक्ति से ग्रामोदय की ओर',
        orgPurposeHindi: store.villageSettings?.orgPurposeHindi,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: villages.id,
        set: {
          name: store.villageSettings?.name || 'Rasoolpur',
          nameHindi: store.villageSettings?.nameHindi || 'रसूलपुर',
          orgName: store.villageSettings?.orgName || 'Gramodaya Youth Manch',
          orgNameHindi: store.villageSettings?.orgNameHindi || 'ग्रामोदय यूथ मंच',
        },
      });

    // 5. Seed System Permissions Catalog
    console.log(`Inserting ${ALL_SYSTEM_PERMISSIONS.length} system permissions...`);
    for (const perm of ALL_SYSTEM_PERMISSIONS) {
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

    // 6. Seed Admins
    console.log(`Inserting ${store.admins.length} admins...`);
    for (const admin of store.admins) {
      await db
        .insert(members)
        .values({
          id: admin.id,
          villageId: 'vil_rasoolpur',
          name: admin.name,
          mobile: admin.mobile,
          role: 'ADMIN',
          systemRole: admin.isHead ? 'SUPER_ADMIN' : 'ADMIN',
          status: 'active',
          photoUrl: admin.photoUrl || null,
          organizationName: store.villageSettings?.orgNameHindi || 'ग्रामोदय यूथ मंच',
          address: `${admin.village || 'Rasoolpur'}, ग्राम पंचायत ${admin.gramPanchayat || 'Bahera'}`,
        })
        .onConflictDoUpdate({
          target: members.id,
          set: {
            name: admin.name,
            mobile: admin.mobile,
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
          id: member.id,
          villageId: 'vil_rasoolpur',
          name: member.name,
          mobile: member.mobile,
          role: 'MEMBER',
          systemRole: 'MEMBER',
          status: member.status,
          organizationName: member.organizationName || store.villageSettings?.orgNameHindi || 'ग्रामोदय यूथ मंच',
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
          id: ann.id,
          villageId: 'vil_rasoolpur',
          title: ann.title,
          content: ann.content,
          publishedBy: ann.publishedBy || 'ग्रामोदय यूथ मंच',
        })
        .onConflictDoNothing();
    }

    console.log('✅ Multi-tenant and PBAC database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
