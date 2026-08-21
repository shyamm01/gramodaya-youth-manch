/**
 * GET /api/education
 * The whole module in one call: categories with their nested resources and
 * links — what the education landing page and category pages render.
 *
 * Query: ?category=<slug> (single category), ?scope=gramodaya|government,
 *        ?includeLinks=false, ?status=... (privileged callers only),
 *        ?villageId=<id> (honored only for callers granted that village).
 */
import { NextResponse } from 'next/server';
import { getEducationTree } from '@/src/lib/education/service';
import { resolveEducationScope } from '@/src/lib/education/params';
import { educationErrorResponse } from '@/src/lib/education/response';
import { formatEducationCategory } from '@/src/lib/apiResponse';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const scope = await resolveEducationScope(req);
    const scopeFilter = url.searchParams.get('scope') as 'gramodaya' | 'government' | null;

    const tree = await getEducationTree({
      villageId: scope.villageId,
      includeGlobal: scope.includeGlobal,
      status: scope.status,
      includeLinks: url.searchParams.get('includeLinks') !== 'false',
      categorySlug: url.searchParams.get('category') || undefined,
    });

    // Scope filtering ("show only the Manch's own programmes") applies to the
    // items, not the categories — a category stays visible but may come back
    // with fewer cards.
    const filtered = scopeFilter
      ? tree.map((c) => ({ ...c, resources: c.resources.filter((r: any) => r.scope === scopeFilter) }))
      : tree;

    return NextResponse.json({
      success: true,
      categories: filtered.map(formatEducationCategory),
    });
  } catch (err: any) {
    return educationErrorResponse(err, 'Failed to fetch education content');
  }
}
