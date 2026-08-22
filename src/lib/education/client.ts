/**
 * Browser-side access to the education API.
 *
 * Kept separate from ./service (which imports Drizzle and is server-only) so
 * client components can import these helpers without pulling the database
 * layer into the bundle — import from '@/src/lib/education/client' directly,
 * never from the folder index.
 */
import type { EducationCategory, EducationResource } from '@/src/types';

export interface EnquiryPayload {
  name: string;
  mobile: string;
  message: string;
  email?: string;
  studentClass?: string;
  resourceId?: string;
  categoryId?: string;
}

/**
 * Reads the server's own error message off a failed response so the UI can show
 * what actually went wrong instead of a generic "something failed".
 */
async function readError(res: Response, fallback: string): Promise<Error> {
  const body = await res.json().catch(() => null);
  return new Error(body?.error || `${fallback} (HTTP ${res.status})`);
}

/**
 * Collapses identical GETs that overlap in time onto a single request.
 *
 * StrictMode runs every effect twice in development, so a component that loads
 * on mount fires the same request twice — the first showed up in the network
 * panel as a cancelled request next to the real one. Two components asking for
 * the same data at once hit it too, in development and production alike.
 *
 * The entry is dropped as soon as the request settles, so this de-duplicates
 * concurrent callers without ever serving stale data on a later visit.
 */
const inFlight = new Map<string, Promise<unknown>>();

function dedupe<T>(key: string, run: () => Promise<T>): Promise<T> {
  const pending = inFlight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const request = run().finally(() => {
    inFlight.delete(key);
  });
  inFlight.set(key, request);
  return request;
}

/** GET /api/education — every published category with its resources and links. */
export function fetchEducationTree(): Promise<EducationCategory[]> {
  return dedupe('tree', async () => {
    const res = await fetch('/api/education', { credentials: 'include' });
    if (!res.ok) throw await readError(res, 'Education request failed');
    const data = await res.json();
    if (!data.success || !Array.isArray(data.categories)) {
      throw new Error(data.error || 'Malformed education response');
    }
    return data.categories as EducationCategory[];
  });
}

/** GET /api/education/categories/[slug] — one category with its resources. */
export function fetchEducationCategory(slug: string): Promise<EducationCategory | null> {
  return dedupe(`category:${slug}`, async () => {
    const res = await fetch(`/api/education/categories/${encodeURIComponent(slug)}`, {
      credentials: 'include',
    });
    if (res.status === 404) return null;
    if (!res.ok) throw await readError(res, 'Education category request failed');
    const data = await res.json();
    if (!data.success || !data.category) {
      throw new Error(data.error || 'Malformed category response');
    }
    return data.category as EducationCategory;
  });
}

/**
 * GET /api/education/categories/[slug]/resources/[resourceSlug] — one scheme
 * plus the category around it, which is what /education/<cat>/<res> renders.
 *
 * Returns null when either half of the URL does not resolve, so the page can
 * show "not found" instead of an error the visitor cannot act on.
 */
export function fetchEducationResource(
  categorySlug: string,
  resourceSlug: string
): Promise<{ category: EducationCategory; resource: EducationResource } | null> {
  return dedupe(`resource:${categorySlug}/${resourceSlug}`, async () => {
    const res = await fetch(
      `/api/education/categories/${encodeURIComponent(categorySlug)}/resources/${encodeURIComponent(
        resourceSlug
      )}`,
      { credentials: 'include' }
    );
    if (res.status === 404) return null;
    if (!res.ok) throw await readError(res, 'Education resource request failed');
    const data = await res.json();
    if (!data.success || !data.resource || !data.category) {
      throw new Error(data.error || 'Malformed resource response');
    }
    return {
      category: data.category as EducationCategory,
      resource: data.resource as EducationResource,
    };
  });
}

/** POST /api/education/enquiries — public, no login required. */
export async function submitEducationEnquiry(
  payload: EnquiryPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/education/enquiries', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Could not send your request. Please try again.' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

type Translate = (key: string, params?: Record<string, string | number>) => string;

/**
 * Resolves a piece of education text for the active language.
 *
 * Seeded rows carry an i18n key and render through the locale files; rows an
 * admin created have no key and fall back to the stored English/Hindi columns.
 * A key that is missing from the dictionary (t() echoes the key back) also
 * falls through to the stored text rather than showing "education.foo.title".
 */
export function localizeEducationText(
  t: Translate,
  lang: string,
  field: { key?: string; text?: string; textHindi?: string }
): string {
  if (field.key) {
    const translated = t(field.key);
    if (translated && translated !== field.key) return translated;
  }
  const preferred = lang === 'en' ? field.text : field.textHindi;
  return preferred || field.text || field.textHindi || '';
}

export const categoryName = (t: Translate, lang: string, c: EducationCategory) =>
  localizeEducationText(t, lang, { key: c.nameKey, text: c.name, textHindi: c.nameHindi });

export const categoryOverview = (t: Translate, lang: string, c: EducationCategory) =>
  localizeEducationText(t, lang, {
    key: c.overviewKey,
    text: c.overview,
    textHindi: c.overviewHindi,
  });

export const resourceTitle = (t: Translate, lang: string, r: EducationResource) =>
  localizeEducationText(t, lang, { key: r.titleKey, text: r.title, textHindi: r.titleHindi });

/**
 * Label for the card's action button.
 *
 * Stored per resource so an admin can say "Apply now" on a scheme with an open
 * window and "Check eligibility" on one that needs a test first. A row that
 * leaves it blank — which is every row until someone sets it — falls back to
 * the UI's own translated "Learn more", so the button is never empty and never
 * stuck in the wrong language.
 */
export const resourceCtaLabel = (t: Translate, lang: string, r: EducationResource) =>
  localizeEducationText(t, lang, { text: r.ctaLabel, textHindi: r.ctaLabelHindi }) ||
  t('education.card.cta');

export const resourceDescription = (t: Translate, lang: string, r: EducationResource) =>
  localizeEducationText(t, lang, {
    key: r.descriptionKey,
    text: r.description,
    textHindi: r.descriptionHindi,
  });

/**
 * The long-form detail fields, resolved for the active language.
 *
 * These carry no i18n key — they are database content rather than shipped
 * strings — so they read the Hindi column when it exists and fall back to the
 * English one, which is what an admin-written row will have.
 */
export const resourceEligibility = (t: Translate, lang: string, r: EducationResource) =>
  localizeEducationText(t, lang, { text: r.eligibility, textHindi: r.eligibilityHindi });

export const resourceBenefits = (t: Translate, lang: string, r: EducationResource) =>
  localizeEducationText(t, lang, { text: r.benefits, textHindi: r.benefitsHindi });

export const resourceHowToApply = (t: Translate, lang: string, r: EducationResource) =>
  localizeEducationText(t, lang, { text: r.howToApply, textHindi: r.howToApplyHindi });

export const resourceProvider = (t: Translate, lang: string, r: EducationResource) =>
  localizeEducationText(t, lang, { text: r.provider, textHindi: r.providerHindi });

/** Document list for the active language, falling back item-for-item is not
 *  possible — the two lists are independent, so the whole list switches. */
export const resourceDocuments = (lang: string, r: EducationResource): string[] => {
  const preferred = lang === 'en' ? r.documentsRequired : r.documentsRequiredHindi;
  return preferred?.length ? preferred : r.documentsRequired || r.documentsRequiredHindi || [];
};
