/**
 * Seeds the education module with the default categories and schemes from
 * src/data/educationContent.ts, and the full detail sheet for each scheme from
 * src/data/educationResourceDetails.ts.
 *
 * Idempotent: rows are matched on slug, so re-running updates the seeded text
 * (e.g. after a locale change) instead of duplicating it. Seeded content is
 * platform-wide (village_id IS NULL) — every village chapter sees it, and each
 * chapter can add its own rows on top.
 *
 * A detail sheet is optional. A scheme with no entry keeps whatever the columns
 * already hold rather than being blanked, so re-seeding never wipes detail an
 * admin has since written by hand.
 */
import { getDb } from './index';
import { educationCategories, educationResourceLinks, educationResources } from './schema';
import { EDUCATION_SEED_CATEGORIES } from '../data/educationContent';
import { EDUCATION_RESOURCE_DETAILS } from '../data/educationResourceDetails';
import { and, eq, isNull } from 'drizzle-orm';

export async function seedEducationContent() {
  const db = getDb();
  if (!db) {
    throw new Error('Database connection is not configured.');
  }

  let categoriesSeeded = 0;
  let resourcesSeeded = 0;
  let linksSeeded = 0;

  for (const category of EDUCATION_SEED_CATEGORIES) {
    const categoryValues = {
      slug: category.slug,
      name: category.name,
      nameHindi: category.nameHindi,
      nameKey: category.nameKey,
      overview: category.overview,
      overviewHindi: category.overviewHindi,
      overviewKey: category.overviewKey,
      icon: category.icon,
      displayOrder: category.displayOrder,
      status: 'published' as const,
    };

    const [existingCategory] = await db
      .select({ id: educationCategories.id })
      .from(educationCategories)
      .where(
        and(eq(educationCategories.slug, category.slug), isNull(educationCategories.villageId))
      )
      .limit(1);

    let categoryId: number;
    if (existingCategory) {
      const [updated] = await db
        .update(educationCategories)
        .set({ ...categoryValues, updatedAt: new Date() })
        .where(eq(educationCategories.id, existingCategory.id))
        .returning({ id: educationCategories.id });
      categoryId = updated.id;
    } else {
      const [inserted] = await db
        .insert(educationCategories)
        .values({ ...categoryValues, villageId: null })
        .returning({ id: educationCategories.id });
      categoryId = inserted.id;
    }
    categoriesSeeded++;

    for (const resource of category.resources) {
      const detail = EDUCATION_RESOURCE_DETAILS[resource.slug];

      const resourceValues = {
        categoryId,
        slug: resource.slug,
        title: resource.title,
        titleHindi: resource.titleHindi,
        titleKey: resource.titleKey,
        description: resource.description,
        descriptionHindi: resource.descriptionHindi,
        descriptionKey: resource.descriptionKey,
        icon: resource.icon,
        scope: resource.scope,
        type: resource.type,
        status: 'published' as const,
        displayOrder: resource.displayOrder,
        // Spread last and only when a sheet exists: an absent detail file must
        // leave the existing columns alone, not overwrite them with undefined.
        ...(detail
          ? {
              provider: detail.provider ?? null,
              providerHindi: detail.providerHindi ?? null,
              externalUrl: detail.externalUrl ?? null,
              eligibility: detail.eligibility ?? null,
              eligibilityHindi: detail.eligibilityHindi ?? null,
              benefits: detail.benefits ?? null,
              benefitsHindi: detail.benefitsHindi ?? null,
              howToApply: detail.howToApply ?? null,
              howToApplyHindi: detail.howToApplyHindi ?? null,
              documentsRequired: detail.documentsRequired ?? null,
              documentsRequiredHindi: detail.documentsRequiredHindi ?? null,
              tags: detail.tags ?? null,
              ctaLabel: detail.ctaLabel ?? null,
              ctaLabelHindi: detail.ctaLabelHindi ?? null,
            }
          : {}),
      };

      const [existingResource] = await db
        .select({ id: educationResources.id })
        .from(educationResources)
        .where(
          and(
            eq(educationResources.categoryId, categoryId),
            eq(educationResources.slug, resource.slug)
          )
        )
        .limit(1);

      let resourceId: number;
      if (existingResource) {
        await db
          .update(educationResources)
          .set({ ...resourceValues, updatedAt: new Date() })
          .where(eq(educationResources.id, existingResource.id));
        resourceId = existingResource.id;
      } else {
        const [inserted] = await db
          .insert(educationResources)
          .values({ ...resourceValues, villageId: null })
          .returning({ id: educationResources.id });
        resourceId = inserted.id;
      }
      resourcesSeeded++;

      // Links live in their own table with no natural key to match on, so the
      // seeded set is replaced wholesale rather than merged. Only touched when
      // the sheet actually lists links — otherwise an admin's own links would
      // be deleted on every re-seed.
      if (detail?.links?.length) {
        await db
          .delete(educationResourceLinks)
          .where(eq(educationResourceLinks.resourceId, resourceId));

        await db.insert(educationResourceLinks).values(
          detail.links.map((link, index) => ({
            resourceId,
            label: link.label,
            labelHindi: link.labelHindi,
            url: link.url,
            type: link.type,
            displayOrder: index,
          }))
        );
        linksSeeded += detail.links.length;
      }
    }
  }

  console.log(
    `Seeded education module: ${categoriesSeeded} categories, ${resourcesSeeded} resources, ${linksSeeded} links.`
  );
  return { categoriesSeeded, resourcesSeeded, linksSeeded };
}

// Allow running this seeder on its own: `bun src/db/seedEducation.ts`
if (import.meta.main) {
  seedEducationContent()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Education seed failed:', err);
      process.exit(1);
    });
}
