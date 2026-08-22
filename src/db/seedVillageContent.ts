/**
 * Seeds the announcements, social initiatives and grievances from
 * src/data/villageContent.ts.
 *
 * Idempotent: rows are matched on (village, title), so re-running refreshes the
 * seeded text and the relative dates instead of duplicating the rows. Only rows
 * this seeder wrote are touched — anything a chapter added itself is matched by
 * no title here and is left exactly as it is.
 *
 * Unlike the education seed, this content is village-scoped rather than
 * platform-wide: a notice board and a grievance list belong to one chapter, not
 * to every chapter at once. It seeds into the first village in the table.
 */
import { getDb } from './index';
import { announcements, complaints, complaintAttachments, socialWorks, villages } from './schema';
import {
  ANNOUNCEMENT_SEEDS,
  COMPLAINT_SEEDS,
  SOCIAL_WORK_SEEDS,
} from '../data/villageContent';
import { and, asc, eq, or } from 'drizzle-orm';

/** Relative dates keep the seeded lists from looking abandoned over time. */
function dateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

export async function seedVillageContent() {
  const db = getDb();
  if (!db) throw new Error('Database connection is not configured.');

  const [village] = await db
    .select({ id: villages.id, name: villages.name })
    .from(villages)
    .orderBy(asc(villages.id))
    .limit(1);

  if (!village) {
    throw new Error('No village exists yet — run `bun run db:seed` first.');
  }

  const villageId = village.id;
  let announcementsSeeded = 0;
  let socialWorksSeeded = 0;
  let complaintsSeeded = 0;

  for (const seed of ANNOUNCEMENT_SEEDS) {
    const values = {
      villageId,
      title: seed.title,
      content: seed.content,
      publishedBy: seed.publishedBy,
      isUrgent: seed.isUrgent,
      date: dateDaysAgo(seed.daysAgo),
    };

    const [existing] = await db
      .select({ id: announcements.id })
      .from(announcements)
      .where(and(eq(announcements.villageId, villageId), eq(announcements.title, seed.title)))
      .limit(1);

    if (existing) {
      await db
        .update(announcements)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(announcements.id, existing.id));
    } else {
      await db.insert(announcements).values(values);
    }
    announcementsSeeded++;
  }

  for (const seed of SOCIAL_WORK_SEEDS) {
    const values = {
      villageId,
      title: seed.title,
      description: seed.description,
      date: dateDaysAgo(seed.daysAgo),
      location: seed.location,
      submitterName: seed.submitterName,
      submitterMobile: seed.submitterMobile,
      status: seed.status,
    };

    const [existing] = await db
      .select({ id: socialWorks.id })
      .from(socialWorks)
      .where(and(eq(socialWorks.villageId, villageId), eq(socialWorks.title, seed.title)))
      .limit(1);

    if (existing) {
      await db
        .update(socialWorks)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(socialWorks.id, existing.id));
    } else {
      await db.insert(socialWorks).values(values);
    }
    socialWorksSeeded++;
  }

  for (const seed of COMPLAINT_SEEDS) {
    const values = {
      villageId,
      title: seed.title,
      titleHindi: seed.titleHindi,
      category: seed.category,
      priority: seed.priority || 'medium',
      description: seed.description,
      descriptionHindi: seed.descriptionHindi,
      location: seed.location,
      locationHindi: seed.locationHindi,
      ward: seed.ward || null,
      wardHindi: seed.wardHindi || null,
      reporterName: seed.reporterName,
      reporterMobile: seed.reporterMobile,
      photoUrl: seed.photoUrl || null,
      status: seed.status,
      isActive: true,
      resolvedAt: seed.status === 'RESOLVED' ? new Date() : null,
    };

    const [existing] = await db
      .select({ id: complaints.id })
      .from(complaints)
      .where(
        and(
          eq(complaints.villageId, villageId),
          or(eq(complaints.title, seed.title), eq(complaints.titleHindi, seed.titleHindi))
        )
      )
      .limit(1);

    let complaintId: number;
    if (existing) {
      complaintId = existing.id;
      await db
        .update(complaints)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(complaints.id, existing.id));
    } else {
      const [inserted] = await db.insert(complaints).values(values).returning({ id: complaints.id });
      complaintId = inserted.id;
    }

    if (seed.photoUrl) {
      const [existingAtt] = await db
        .select({ id: complaintAttachments.id })
        .from(complaintAttachments)
        .where(and(eq(complaintAttachments.complaintId, complaintId), eq(complaintAttachments.url, seed.photoUrl)))
        .limit(1);

      if (!existingAtt) {
        await db.insert(complaintAttachments).values({
          complaintId,
          type: 'photo',
          url: seed.photoUrl,
          caption: seed.title,
        });
      }
    }

    complaintsSeeded++;
  }

  console.log(
    `Seeded village content for "${village.name}": ${announcementsSeeded} announcements, ` +
      `${socialWorksSeeded} social works, ${complaintsSeeded} grievances.`
  );
  return { announcementsSeeded, socialWorksSeeded, complaintsSeeded };
}

// Allow running this seeder on its own: `bun src/db/seedVillageContent.ts`
if (import.meta.main) {
  seedVillageContent()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Village content seed failed:', err);
      process.exit(1);
    });
}
