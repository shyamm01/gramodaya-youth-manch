/**
 * Seeds the education module with the default categories and schemes from
 * src/data/educationContent.ts.
 *
 * Idempotent: rows are matched on slug, so re-running updates the seeded text
 * (e.g. after a locale change) instead of duplicating it. Seeded content is
 * platform-wide (village_id IS NULL) — every village chapter sees it, and each
 * chapter can add its own rows on top.
 */
import { getDb } from './index';
import { educationCategories, educationResources } from './schema';
import { EDUCATION_SEED_CATEGORIES } from '../data/educationContent';
import { and, eq, isNull } from 'drizzle-orm';

export async function seedEducationContent() {
  const db = getDb();
  if (!db) {
    throw new Error('Database connection is not configured.');
  }

  let categoriesSeeded = 0;
  let resourcesSeeded = 0;

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

      if (existingResource) {
        await db
          .update(educationResources)
          .set({ ...resourceValues, updatedAt: new Date() })
          .where(eq(educationResources.id, existingResource.id));
      } else {
        await db.insert(educationResources).values({ ...resourceValues, villageId: null });
      }
      resourcesSeeded++;
    }
  }

  console.log(
    `Seeded education module: ${categoriesSeeded} categories, ${resourcesSeeded} resources.`
  );
  return { categoriesSeeded, resourcesSeeded };
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
