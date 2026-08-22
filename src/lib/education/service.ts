/**
 * Education module data access.
 *
 * Every route under /api/education goes through this layer instead of talking
 * to Drizzle directly, so filtering, village scoping, slug generation and the
 * published/draft visibility rules stay in one place. Adding a new education
 * surface (an admin screen, a mobile client, a report) means calling these
 * functions, not rewriting the queries.
 */
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { and, asc, desc, eq, ilike, inArray, isNull, or, sql, type SQL } from 'drizzle-orm';

type Db = NonNullable<ReturnType<typeof getDb>>;

export type EducationStatusFilter = 'draft' | 'pending' | 'published' | 'archived' | 'all';

export interface EducationScopeOptions {
  /** Village whose chapter-specific content should be included. */
  villageId?: number | null;
  /** Also include platform-wide rows (village_id IS NULL). Defaults to true. */
  includeGlobal?: boolean;
  /** Defaults to 'published' — only an authorized caller should widen this. */
  status?: EducationStatusFilter;
}

export interface ResourceFilters extends EducationScopeOptions {
  categoryId?: number;
  categorySlug?: string;
  scope?: 'gramodaya' | 'government';
  type?: string;
  search?: string;
  tag?: string;
  limit?: number;
  offset?: number;
  includeLinks?: boolean;
}

export interface EnquiryFilters {
  villageId?: number | null;
  status?: 'new' | 'in_progress' | 'resolved' | 'closed' | 'all';
  resourceId?: number;
  mobile?: string;
  limit?: number;
  offset?: number;
}

/**
 * The subset of the authenticated user this layer needs. Routes already check
 * the permission code; this is about *which village's* content the caller may
 * touch, which the permission code alone does not express.
 */
export interface EducationActor {
  id?: string;
  systemRole?: string;
  isSuperAdmin?: boolean;
  isAdmin?: boolean;
  villageId?: string;
  accessibleVillages?: string[];
}

export class EducationError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'EducationError';
    this.status = status;
  }
}

export function getEducationDb(): Db {
  const db = getDb();
  if (!db) {
    throw new EducationError('Database connection unavailable.', 503);
  }
  return db;
}

/**
 * created_by is a FK to profiles. A token can legitimately carry an id with no
 * profiles row behind it (a Supabase Auth user whose profile row was never
 * created), and losing the attribution is much better than failing the write —
 * so verify first and fall back to null.
 */
async function resolveCreatedBy(userId?: string): Promise<string | null> {
  if (!userId) return null;
  const db = getEducationDb();
  try {
    const [profile] = await db
      .select({ id: schema.profiles.id })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId))
      .limit(1);
    return profile ? profile.id : null;
  } catch {
    return null;
  }
}

/**
 * village_id is a FK to villages. Callers can hand us a village that does not
 * exist — resolveVillageId() defaults anonymous requests to village 1, which is
 * not a real row on every deployment — so verify it and fall back to NULL
 * (platform-wide) instead of failing the write on a foreign key violation.
 */
async function resolveVillageRef(villageId: unknown): Promise<number | null> {
  const numeric = toNumericId(villageId);
  if (!numeric) return null;
  const db = getEducationDb();
  try {
    const [village] = await db
      .select({ id: schema.villages.id })
      .from(schema.villages)
      .where(eq(schema.villages.id, numeric))
      .limit(1);
    return village ? village.id : null;
  } catch {
    return null;
  }
}

/**
 * Guards village-scoped rows: an admin granted village A must not be able to
 * edit or delete village B's education content just because they hold
 * education:manage. Platform-wide rows (village_id IS NULL) are left to the
 * permission check alone, as is a token that carries no village grants at all
 * (better than locking a legitimate admin out of the module entirely).
 */
export function assertVillageAccess(actor: EducationActor | undefined, villageId: number | null | undefined) {
  if (villageId === null || villageId === undefined) return;
  if (!actor) return;
  if (actor.isSuperAdmin || actor.systemRole === 'SUPER_ADMIN') return;

  const granted = new Set(
    [...(actor.accessibleVillages || []), actor.villageId].filter(Boolean).map(String)
  );
  if (granted.size === 0) return;
  if (!granted.has(String(villageId))) {
    throw new EducationError("You do not have access to this village's education content.", 403);
  }
}

/** URL-safe slug from any title, Hindi included (falls back to a timestamp). */
export function slugify(value: string, fallback = 'item'): string {
  const slug = (value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return slug || `${fallback}-${Date.now()}`;
}

export function toNumericId(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function isNumericId(value: string): boolean {
  return /^\d+$/.test(value);
}

/**
 * village_id = X OR village_id IS NULL — a chapter sees its own content plus
 * everything published platform-wide.
 */
function villageCondition(column: any, opts: EducationScopeOptions): SQL | undefined {
  const includeGlobal = opts.includeGlobal !== false;
  const villageId = opts.villageId ?? null;

  if (villageId === null) {
    return includeGlobal ? isNull(column) : undefined;
  }
  return includeGlobal
    ? or(eq(column, villageId), isNull(column))
    : eq(column, villageId);
}

function statusCondition(column: any, status?: EducationStatusFilter): SQL | undefined {
  const effective = status || 'published';
  return effective === 'all' ? undefined : eq(column, effective as any);
}

// ============================================================================
// CATEGORIES
// ============================================================================

export async function listCategories(opts: EducationScopeOptions = {}) {
  const db = getEducationDb();
  const conditions = [
    villageCondition(schema.educationCategories.villageId, opts),
    statusCondition(schema.educationCategories.status, opts.status),
  ].filter(Boolean) as SQL[];

  const rows = await db
    .select()
    .from(schema.educationCategories)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(schema.educationCategories.displayOrder), asc(schema.educationCategories.id));

  if (rows.length === 0) return [];

  // Resource counts in one grouped query rather than N per-category queries.
  const countConditions = [
    inArray(schema.educationResources.categoryId, rows.map((c) => c.id)),
    statusCondition(schema.educationResources.status, opts.status),
  ].filter(Boolean) as SQL[];

  const counts = await db
    .select({
      categoryId: schema.educationResources.categoryId,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.educationResources)
    .where(and(...countConditions))
    .groupBy(schema.educationResources.categoryId);

  const countMap = new Map(counts.map((c) => [Number(c.categoryId), Number(c.count)]));
  return rows.map((c) => ({ ...c, resourceCount: countMap.get(Number(c.id)) ?? 0 }));
}

export async function getCategory(idOrSlug: string, opts: EducationScopeOptions = {}) {
  const db = getEducationDb();
  const conditions = [
    isNumericId(idOrSlug)
      ? eq(schema.educationCategories.id, Number(idOrSlug))
      : eq(schema.educationCategories.slug, idOrSlug),
    villageCondition(schema.educationCategories.villageId, opts),
    statusCondition(schema.educationCategories.status, opts.status),
  ].filter(Boolean) as SQL[];

  const [row] = await db
    .select()
    .from(schema.educationCategories)
    .where(and(...conditions))
    // Slugs are unique per village but not across villages — order so the same
    // request always resolves to the same row.
    .orderBy(asc(schema.educationCategories.id))
    .limit(1);

  return row || null;
}

/**
 * The whole module in one payload: categories, each with its resources (and
 * their links). This is what the education landing and category pages render.
 */
export async function getEducationTree(
  opts: EducationScopeOptions & { includeLinks?: boolean; categorySlug?: string } = {}
) {
  const categories = await listCategories(opts);
  const scoped = opts.categorySlug
    ? categories.filter((c) => c.slug === opts.categorySlug)
    : categories;

  if (scoped.length === 0) return [];

  const resources = await listResources({
    ...opts,
    categoryIds: scoped.map((c) => c.id),
    includeLinks: opts.includeLinks,
  } as ResourceFilters & { categoryIds: number[] });

  const byCategory = new Map<number, any[]>();
  for (const r of resources) {
    const key = Number(r.categoryId);
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(r);
  }

  return scoped.map((c) => ({ ...c, resources: byCategory.get(Number(c.id)) || [] }));
}

export async function createCategory(
  values: Record<string, any>,
  createdBy?: string,
  actor?: EducationActor
) {
  const db = getEducationDb();
  const villageId = await resolveVillageRef(values.villageId);
  assertVillageAccess(actor, villageId);
  const slug = values.slug || slugify(values.name || values.nameHindi || '', 'category');

  const clash = await db
    .select({ id: schema.educationCategories.id })
    .from(schema.educationCategories)
    .where(
      and(
        eq(schema.educationCategories.slug, slug),
        villageId === null
          ? isNull(schema.educationCategories.villageId)
          : eq(schema.educationCategories.villageId, villageId)
      )
    )
    .limit(1);

  if (clash.length > 0) {
    throw new EducationError(`A category with slug "${slug}" already exists.`, 409);
  }

  const [inserted] = await db
    .insert(schema.educationCategories)
    .values({
      villageId,
      slug,
      name: (values.name || '').trim(),
      nameHindi: values.nameHindi?.trim() || null,
      nameKey: values.nameKey || null,
      overview: values.overview?.trim() || null,
      overviewHindi: values.overviewHindi?.trim() || null,
      overviewKey: values.overviewKey || null,
      icon: values.icon || 'GraduationCap',
      displayOrder: values.displayOrder ?? 0,
      status: values.status || 'published',
      metadata: values.metadata ?? null,
      createdBy: await resolveCreatedBy(createdBy),
    })
    .returning();

  return inserted;
}

export async function updateCategory(
  idOrSlug: string,
  values: Record<string, any>,
  actor?: EducationActor
) {
  const db = getEducationDb();
  const existing = await getCategoryAnyScope(idOrSlug);
  if (!existing) throw new EducationError('Education category not found.', 404);
  assertVillageAccess(actor, existing.villageId);

  const patch: Record<string, any> = { updatedAt: new Date() };
  const textFields = [
    'name',
    'nameHindi',
    'nameKey',
    'overview',
    'overviewHindi',
    'overviewKey',
    'icon',
  ];
  for (const field of textFields) {
    if (values[field] !== undefined) {
      patch[field] = typeof values[field] === 'string' ? values[field].trim() || null : values[field];
    }
  }
  if (values.slug !== undefined) {
    const nextSlug = slugify(values.slug, 'category');
    const nextVillageId =
      values.villageId !== undefined ? await resolveVillageRef(values.villageId) : existing.villageId;
    const [clash] = await db
      .select({ id: schema.educationCategories.id })
      .from(schema.educationCategories)
      .where(
        and(
          eq(schema.educationCategories.slug, nextSlug),
          nextVillageId === null
            ? isNull(schema.educationCategories.villageId)
            : eq(schema.educationCategories.villageId, nextVillageId)
        )
      )
      .limit(1);
    if (clash && clash.id !== existing.id) {
      throw new EducationError(`A category with slug "${nextSlug}" already exists.`, 409);
    }
    patch.slug = nextSlug;
  }
  if (values.displayOrder !== undefined) patch.displayOrder = values.displayOrder;
  if (values.status !== undefined) patch.status = values.status;
  if (values.metadata !== undefined) patch.metadata = values.metadata;
  if (values.villageId !== undefined) {
    patch.villageId = await resolveVillageRef(values.villageId);
    assertVillageAccess(actor, patch.villageId);
  }
  // `name` is NOT NULL — never let a blank string through.
  if (patch.name === null) delete patch.name;

  const [updated] = await db
    .update(schema.educationCategories)
    .set(patch)
    .where(eq(schema.educationCategories.id, existing.id))
    .returning();

  return updated;
}

/** Lookup that ignores village/status scoping — for admin edit and delete. */
export async function getCategoryAnyScope(idOrSlug: string) {
  const db = getEducationDb();
  const [row] = await db
    .select()
    .from(schema.educationCategories)
    .where(
      isNumericId(idOrSlug)
        ? eq(schema.educationCategories.id, Number(idOrSlug))
        : eq(schema.educationCategories.slug, idOrSlug)
    )
    .orderBy(asc(schema.educationCategories.id))
    .limit(1);
  return row || null;
}

export async function deleteCategory(idOrSlug: string, actor?: EducationActor) {
  const db = getEducationDb();
  const existing = await getCategoryAnyScope(idOrSlug);
  if (!existing) throw new EducationError('Education category not found.', 404);
  assertVillageAccess(actor, existing.villageId);

  // Resources (and their links) cascade with the category.
  await db.delete(schema.educationCategories).where(eq(schema.educationCategories.id, existing.id));
  return existing;
}

// ============================================================================
// RESOURCES
// ============================================================================

/**
 * Resolves ?category=<slug> to ids once, so the list query and the count query
 * can never disagree about which rows they are talking about.
 * Returns null when the slug matches nothing (caller should return nothing).
 */
async function resolveFilterCategoryIds(
  filters: ResourceFilters & { categoryIds?: number[] }
): Promise<number[] | undefined | null> {
  if (filters.categoryIds) return filters.categoryIds;
  if (!filters.categorySlug) return undefined;

  const category = await getCategory(filters.categorySlug, {
    villageId: filters.villageId,
    includeGlobal: filters.includeGlobal,
    status: 'all',
  });
  return category ? [category.id] : null;
}

/** Every WHERE clause a resource query applies — shared by list and count. */
function buildResourceConditions(
  filters: ResourceFilters,
  categoryIds?: number[]
): SQL[] {
  return [
    villageCondition(schema.educationResources.villageId, filters),
    statusCondition(schema.educationResources.status, filters.status),
    filters.categoryId ? eq(schema.educationResources.categoryId, filters.categoryId) : undefined,
    categoryIds?.length ? inArray(schema.educationResources.categoryId, categoryIds) : undefined,
    filters.scope ? eq(schema.educationResources.scope, filters.scope) : undefined,
    filters.type ? eq(schema.educationResources.type, filters.type as any) : undefined,
    filters.search
      ? or(
          ilike(schema.educationResources.title, `%${filters.search}%`),
          ilike(schema.educationResources.titleHindi, `%${filters.search}%`),
          ilike(schema.educationResources.description, `%${filters.search}%`)
        )
      : undefined,
    filters.tag ? sql`${schema.educationResources.tags} @> ${JSON.stringify([filters.tag])}::jsonb` : undefined,
  ].filter(Boolean) as SQL[];
}

export async function listResources(
  filters: ResourceFilters & { categoryIds?: number[] } = {}
) {
  const db = getEducationDb();

  const categoryIds = await resolveFilterCategoryIds(filters);
  if (categoryIds === null) return [];

  const conditions = buildResourceConditions(filters, categoryIds);

  let query = db
    .select()
    .from(schema.educationResources)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(
      asc(schema.educationResources.displayOrder),
      asc(schema.educationResources.id)
    )
    .$dynamic();

  if (filters.limit) query = query.limit(filters.limit);
  if (filters.offset) query = query.offset(filters.offset);

  const rows = await query;
  if (!filters.includeLinks || rows.length === 0) return rows;

  const links = await db
    .select()
    .from(schema.educationResourceLinks)
    .where(inArray(schema.educationResourceLinks.resourceId, rows.map((r) => r.id)))
    .orderBy(
      asc(schema.educationResourceLinks.displayOrder),
      asc(schema.educationResourceLinks.id)
    );

  const byResource = new Map<number, any[]>();
  for (const link of links) {
    const key = Number(link.resourceId);
    if (!byResource.has(key)) byResource.set(key, []);
    byResource.get(key)!.push(link);
  }

  return rows.map((r) => ({ ...r, links: byResource.get(Number(r.id)) || [] }));
}

export async function countResources(filters: ResourceFilters = {}) {
  const db = getEducationDb();

  // Must apply exactly the filters listResources does, or the pagination total
  // reported alongside a filtered page is a different number entirely.
  const categoryIds = await resolveFilterCategoryIds(filters);
  if (categoryIds === null) return 0;

  const conditions = buildResourceConditions(filters, categoryIds);

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.educationResources)
    .where(conditions.length ? and(...conditions) : undefined);

  return Number(row?.count ?? 0);
}

export async function getResource(
  idOrSlug: string,
  opts: EducationScopeOptions & { includeLinks?: boolean; categoryId?: number } = {}
) {
  const db = getEducationDb();
  const conditions = [
    isNumericId(idOrSlug)
      ? eq(schema.educationResources.id, Number(idOrSlug))
      : eq(schema.educationResources.slug, idOrSlug),
    // Slugs are unique per category, so /education/<category>/<resource> must
    // pin the lookup to that category — two categories may each hold a row
    // slugged "diksha", and only one of them belongs on that URL.
    opts.categoryId ? eq(schema.educationResources.categoryId, opts.categoryId) : undefined,
    statusCondition(schema.educationResources.status, opts.status),
  ].filter(Boolean) as SQL[];

  const [row] = await db
    .select()
    .from(schema.educationResources)
    .where(and(...conditions))
    // An unscoped slug lookup can still match more than one row — resolve it
    // deterministically rather than depending on the scan order.
    .orderBy(asc(schema.educationResources.id))
    .limit(1);

  if (!row) return null;
  if (opts.includeLinks === false) return row;

  const links = await db
    .select()
    .from(schema.educationResourceLinks)
    .where(eq(schema.educationResourceLinks.resourceId, row.id))
    .orderBy(
      asc(schema.educationResourceLinks.displayOrder),
      asc(schema.educationResourceLinks.id)
    );

  return { ...row, links };
}

async function resolveCategoryId(values: Record<string, any>): Promise<number> {
  const direct = toNumericId(values.categoryId);
  if (direct) {
    const category = await getCategoryAnyScope(String(direct));
    if (!category) throw new EducationError('Education category not found.', 404);
    return category.id;
  }
  if (values.categorySlug) {
    const category = await getCategoryAnyScope(values.categorySlug);
    if (!category) throw new EducationError(`Category "${values.categorySlug}" not found.`, 404);
    return category.id;
  }
  throw new EducationError('categoryId or categorySlug is required.', 400);
}

/** Appends -2, -3 … until the (category_id, slug) pair is free. */
async function uniqueResourceSlug(categoryId: number, base: string, ignoreId?: number) {
  const db = getEducationDb();
  let candidate = base;
  for (let attempt = 2; attempt < 50; attempt++) {
    const rows = await db
      .select({ id: schema.educationResources.id })
      .from(schema.educationResources)
      .where(
        and(
          eq(schema.educationResources.categoryId, categoryId),
          eq(schema.educationResources.slug, candidate)
        )
      )
      .limit(1);
    if (rows.length === 0 || (ignoreId && rows[0].id === ignoreId)) return candidate;
    candidate = `${base}-${attempt}`;
  }
  return `${base}-${Date.now()}`;
}

function resourceContentPatch(values: Record<string, any>) {
  const patch: Record<string, any> = {};
  const textFields = [
    'title',
    'titleHindi',
    'titleKey',
    'description',
    'descriptionHindi',
    'descriptionKey',
    'icon',
    'eligibility',
    'benefits',
    'howToApply',
    'eligibilityHindi',
    'benefitsHindi',
    'howToApplyHindi',
    'provider',
    'providerHindi',
    'externalUrl',
    'photoUrl',
    'contactName',
    'contactMobile',
    'ctaLabel',
    'ctaLabelHindi',
  ];
  for (const field of textFields) {
    if (values[field] !== undefined) {
      patch[field] = typeof values[field] === 'string' ? values[field].trim() || null : values[field];
    }
  }
  for (const field of ['scope', 'type', 'status']) {
    if (values[field] !== undefined) patch[field] = values[field];
  }
  for (const field of ['documentsRequired', 'documentsRequiredHindi', 'tags', 'metadata']) {
    if (values[field] !== undefined) patch[field] = values[field];
  }
  if (values.displayOrder !== undefined) patch.displayOrder = values.displayOrder;
  if (values.startDate !== undefined) patch.startDate = values.startDate || null;
  if (values.endDate !== undefined) patch.endDate = values.endDate || null;
  return patch;
}

export async function createResource(
  values: Record<string, any>,
  createdBy?: string,
  actor?: EducationActor
) {
  const db = getEducationDb();
  const categoryId = await resolveCategoryId(values);
  const villageId = await resolveVillageRef(values.villageId);
  assertVillageAccess(actor, villageId);
  const baseSlug = values.slug || slugify(values.title || values.titleHindi || '', 'resource');
  const slug = await uniqueResourceSlug(categoryId, baseSlug);

  const content = resourceContentPatch(values);
  if (!content.title) throw new EducationError('Title is required.', 400);

  // NOT NULL columns: an empty string in the payload must fall back to the
  // default rather than becoming null.
  content.icon = content.icon || 'BookOpen';
  content.scope = content.scope || 'government';
  content.type = content.type || 'scheme';
  content.status = content.status || 'published';

  const [inserted] = await db
    .insert(schema.educationResources)
    .values({
      ...content,
      categoryId,
      villageId,
      slug,
      createdBy: await resolveCreatedBy(createdBy),
    } as any)
    .returning();

  const links = Array.isArray(values.links) ? await replaceResourceLinks(inserted.id, values.links) : [];
  return { ...inserted, links };
}

export async function updateResource(
  id: string,
  values: Record<string, any>,
  actor?: EducationActor
) {
  const db = getEducationDb();
  const existing = await getResource(id, { status: 'all', includeLinks: false });
  if (!existing) throw new EducationError('Education resource not found.', 404);
  assertVillageAccess(actor, existing.villageId);

  const patch: Record<string, any> = { ...resourceContentPatch(values), updatedAt: new Date() };
  // NOT NULL columns — drop them instead of writing a null.
  for (const field of ['title', 'icon', 'scope', 'type', 'status']) {
    if (patch[field] === null || patch[field] === undefined) delete patch[field];
  }

  if (values.categoryId !== undefined || values.categorySlug !== undefined) {
    patch.categoryId = await resolveCategoryId(values);
  }
  if (values.villageId !== undefined) {
    patch.villageId = await resolveVillageRef(values.villageId);
    assertVillageAccess(actor, patch.villageId);
  }
  if (values.slug !== undefined) {
    patch.slug = await uniqueResourceSlug(
      patch.categoryId ?? existing.categoryId,
      slugify(values.slug, 'resource'),
      existing.id
    );
  }

  const [updated] = await db
    .update(schema.educationResources)
    .set(patch)
    .where(eq(schema.educationResources.id, existing.id))
    .returning();

  const links = Array.isArray(values.links)
    ? await replaceResourceLinks(existing.id, values.links)
    : await listResourceLinks(existing.id);

  return { ...updated, links };
}

export async function setResourceStatus(id: string, status: string, actor?: EducationActor) {
  const db = getEducationDb();
  const existing = await getResource(id, { status: 'all', includeLinks: false });
  if (!existing) throw new EducationError('Education resource not found.', 404);
  assertVillageAccess(actor, existing.villageId);

  const [updated] = await db
    .update(schema.educationResources)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(schema.educationResources.id, existing.id))
    .returning();

  return updated;
}

export async function deleteResource(id: string, actor?: EducationActor) {
  const db = getEducationDb();
  const existing = await getResource(id, { status: 'all', includeLinks: false });
  if (!existing) throw new EducationError('Education resource not found.', 404);
  assertVillageAccess(actor, existing.villageId);

  await db.delete(schema.educationResources).where(eq(schema.educationResources.id, existing.id));
  return existing;
}

// ============================================================================
// RESOURCE LINKS
// ============================================================================

export async function listResourceLinks(resourceId: number) {
  const db = getEducationDb();
  return db
    .select()
    .from(schema.educationResourceLinks)
    .where(eq(schema.educationResourceLinks.resourceId, resourceId))
    .orderBy(
      asc(schema.educationResourceLinks.displayOrder),
      asc(schema.educationResourceLinks.id)
    );
}

/** Links are edited as a set — the payload replaces whatever is stored. */
export async function replaceResourceLinks(resourceId: number, links: any[]) {
  const db = getEducationDb();
  await db
    .delete(schema.educationResourceLinks)
    .where(eq(schema.educationResourceLinks.resourceId, resourceId));

  if (!links || links.length === 0) return [];

  return db
    .insert(schema.educationResourceLinks)
    .values(
      links.map((link, i) => ({
        resourceId,
        label: String(link.label).trim(),
        labelHindi: link.labelHindi?.trim() || null,
        url: String(link.url).trim(),
        type: link.type || 'portal',
        displayOrder: link.displayOrder ?? i,
      }))
    )
    .returning();
}

// ============================================================================
// ENQUIRIES
// ============================================================================

export async function listEnquiries(filters: EnquiryFilters = {}) {
  const db = getEducationDb();
  const conditions = [
    // An enquiry submitted before a village could be resolved has a NULL
    // village_id — keep those visible rather than orphaning them in no inbox.
    filters.villageId
      ? or(eq(schema.educationEnquiries.villageId, filters.villageId), isNull(schema.educationEnquiries.villageId))
      : undefined,
    filters.status && filters.status !== 'all'
      ? eq(schema.educationEnquiries.status, filters.status)
      : undefined,
    filters.resourceId ? eq(schema.educationEnquiries.resourceId, filters.resourceId) : undefined,
    filters.mobile ? eq(schema.educationEnquiries.mobile, filters.mobile) : undefined,
  ].filter(Boolean) as SQL[];

  let query = db
    .select()
    .from(schema.educationEnquiries)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(schema.educationEnquiries.createdAt))
    .$dynamic();

  if (filters.limit) query = query.limit(filters.limit);
  if (filters.offset) query = query.offset(filters.offset);

  return query;
}

export async function createEnquiry(values: Record<string, any>, userId?: string) {
  const db = getEducationDb();
  const resourceId = toNumericId(values.resourceId);
  const categoryId = toNumericId(values.categoryId);
  const linkedUserId = await resolveCreatedBy(userId);
  const villageId = await resolveVillageRef(values.villageId);

  const [inserted] = await db
    .insert(schema.educationEnquiries)
    .values({
      villageId,
      resourceId: resourceId ?? null,
      categoryId: categoryId ?? null,
      userId: linkedUserId,
      name: values.name.trim(),
      mobile: values.mobile,
      email: values.email?.trim() || null,
      studentClass: values.studentClass?.trim() || null,
      message: values.message.trim(),
      status: 'new',
    })
    .returning();

  return inserted;
}

export async function updateEnquiry(
  id: string,
  values: Record<string, any>,
  actor?: EducationActor
) {
  const db = getEducationDb();
  const numId = Number(id);
  if (!Number.isFinite(numId)) throw new EducationError('Invalid enquiry id.', 400);

  const [existing] = await db
    .select({ villageId: schema.educationEnquiries.villageId })
    .from(schema.educationEnquiries)
    .where(eq(schema.educationEnquiries.id, numId))
    .limit(1);
  if (!existing) throw new EducationError('Education enquiry not found.', 404);
  assertVillageAccess(actor, existing.villageId);

  const patch: Record<string, any> = { updatedAt: new Date() };
  if (values.status !== undefined) {
    patch.status = values.status;
    patch.resolvedAt =
      values.status === 'resolved' || values.status === 'closed' ? new Date() : null;
  }
  // assigned_to is a profiles FK — an id with no profile row must not blow up
  // the whole update.
  if (values.assignedTo !== undefined) patch.assignedTo = await resolveCreatedBy(values.assignedTo);
  if (values.response !== undefined) patch.response = values.response?.trim() || null;

  const [updated] = await db
    .update(schema.educationEnquiries)
    .set(patch)
    .where(eq(schema.educationEnquiries.id, numId))
    .returning();

  if (!updated) throw new EducationError('Education enquiry not found.', 404);
  return updated;
}

export async function deleteEnquiry(id: string, actor?: EducationActor) {
  const db = getEducationDb();
  const numId = Number(id);
  if (!Number.isFinite(numId)) throw new EducationError('Invalid enquiry id.', 400);

  const [existing] = await db
    .select({ villageId: schema.educationEnquiries.villageId })
    .from(schema.educationEnquiries)
    .where(eq(schema.educationEnquiries.id, numId))
    .limit(1);
  if (!existing) throw new EducationError('Education enquiry not found.', 404);
  assertVillageAccess(actor, existing.villageId);

  const [deleted] = await db
    .delete(schema.educationEnquiries)
    .where(eq(schema.educationEnquiries.id, numId))
    .returning();

  if (!deleted) throw new EducationError('Education enquiry not found.', 404);
  return deleted;
}
