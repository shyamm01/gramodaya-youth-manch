/**
 * Request → filter translation for the education endpoints.
 *
 * Reading education content is public, so the default path stays anonymous and
 * cheap: only when a caller asks for something other than published content
 * (?status=draft|pending|archived|all) do we pay for token verification, and an
 * unauthorized caller is quietly narrowed back to published rather than erroring.
 */
import { authenticateRequest } from '../jwtAuth';
import { hasUserPermission } from '../permissions';
import { resolveVillageId } from '../villageContext';
import { getRequestLimit } from '../requestParams';
import type { EducationStatusFilter, ResourceFilters } from './service';

const CONTENT_STATUSES = ['draft', 'pending', 'published', 'archived', 'all'] as const;

export interface EducationRequestScope {
  villageId: number;
  includeGlobal: boolean;
  status: EducationStatusFilter;
  /** True when the caller proved they may see unpublished content. */
  canSeeUnpublished: boolean;
}

export async function resolveEducationScope(req: Request): Promise<EducationRequestScope> {
  const url = new URL(req.url);
  const requestedStatus = (url.searchParams.get('status') || '').toLowerCase();
  const wantsRestricted =
    requestedStatus !== '' && requestedStatus !== 'published';

  const villageId = await resolveVillageId(req);
  const includeGlobal = url.searchParams.get('includeGlobal') !== 'false';

  if (!wantsRestricted) {
    return { villageId, includeGlobal, status: 'published', canSeeUnpublished: false };
  }

  const auth = await authenticateRequest(req);
  const canSeeUnpublished =
    auth.success === true &&
    (hasUserPermission(auth.user as any, 'education:view') ||
      hasUserPermission(auth.user as any, 'education:manage'));

  const isKnownStatus = (CONTENT_STATUSES as readonly string[]).includes(requestedStatus);

  return {
    villageId,
    includeGlobal,
    status: canSeeUnpublished && isKnownStatus ? (requestedStatus as EducationStatusFilter) : 'published',
    canSeeUnpublished,
  };
}

/** Query params shared by the resource list endpoints. */
export function parseResourceFilters(req: Request, scope: EducationRequestScope): ResourceFilters {
  const url = new URL(req.url);
  const offsetRaw = Number(url.searchParams.get('offset'));
  const categoryIdRaw = Number(url.searchParams.get('categoryId'));

  return {
    villageId: scope.villageId,
    includeGlobal: scope.includeGlobal,
    status: scope.status,
    categoryId: Number.isFinite(categoryIdRaw) && categoryIdRaw > 0 ? categoryIdRaw : undefined,
    categorySlug: url.searchParams.get('category') || url.searchParams.get('categorySlug') || undefined,
    scope: (url.searchParams.get('scope') as 'gramodaya' | 'government') || undefined,
    type: url.searchParams.get('type') || undefined,
    search: url.searchParams.get('q') || url.searchParams.get('search') || undefined,
    tag: url.searchParams.get('tag') || undefined,
    limit: getRequestLimit(req),
    offset: Number.isFinite(offsetRaw) && offsetRaw > 0 ? offsetRaw : undefined,
    includeLinks: url.searchParams.get('includeLinks') !== 'false',
  };
}
