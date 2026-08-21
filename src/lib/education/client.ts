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

/** GET /api/education — every published category with its resources and links. */
export async function fetchEducationTree(signal?: AbortSignal): Promise<EducationCategory[]> {
  const res = await fetch('/api/education', { credentials: 'include', signal });
  if (!res.ok) throw await readError(res, 'Education request failed');
  const data = await res.json();
  if (!data.success || !Array.isArray(data.categories)) {
    throw new Error(data.error || 'Malformed education response');
  }
  return data.categories as EducationCategory[];
}

/** GET /api/education/categories/[slug] — one category with its resources. */
export async function fetchEducationCategory(
  slug: string,
  signal?: AbortSignal
): Promise<EducationCategory | null> {
  const res = await fetch(`/api/education/categories/${encodeURIComponent(slug)}`, {
    credentials: 'include',
    signal,
  });
  if (res.status === 404) return null;
  if (!res.ok) throw await readError(res, 'Education category request failed');
  const data = await res.json();
  if (!data.success || !data.category) throw new Error(data.error || 'Malformed category response');
  return data.category as EducationCategory;
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

export const resourceDescription = (t: Translate, lang: string, r: EducationResource) =>
  localizeEducationText(t, lang, {
    key: r.descriptionKey,
    text: r.description,
    textHindi: r.descriptionHindi,
  });
