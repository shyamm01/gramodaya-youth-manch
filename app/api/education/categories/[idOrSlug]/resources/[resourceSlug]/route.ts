/**
 * /api/education/categories/[idOrSlug]/resources/[resourceSlug]
 *  GET — one resource with its links, plus the category it belongs to.
 *
 * Mirrors the public URL /education/<category>/<resource>. Resource slugs are
 * only unique within a category, so resolving the category first is what makes
 * the lookup unambiguous. Category and resource come back in one response
 * because the detail page needs both — the resource to render, the category for
 * its heading and back link — and two round trips for one screen is a waste.
 */
import { NextResponse } from 'next/server';
import { getCategory, getResource } from '@/src/lib/education/service';
import { resolveEducationScope } from '@/src/lib/education/params';
import { educationErrorResponse } from '@/src/lib/education/response';
import { formatEducationCategory, formatEducationResource } from '@/src/lib/apiResponse';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ idOrSlug: string; resourceSlug: string }> }
) {
  try {
    const { idOrSlug, resourceSlug } = await params;
    const scope = await resolveEducationScope(req);

    const category = await getCategory(idOrSlug, {
      villageId: scope.villageId,
      includeGlobal: scope.includeGlobal,
      status: scope.status,
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Education category not found.' },
        { status: 404 }
      );
    }

    const resource = await getResource(resourceSlug, {
      villageId: scope.villageId,
      includeGlobal: scope.includeGlobal,
      status: scope.status,
      categoryId: category.id,
      includeLinks: true,
    });

    if (!resource) {
      return NextResponse.json(
        { success: false, error: 'Education resource not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category: formatEducationCategory(category),
      resource: formatEducationResource(resource),
    });
  } catch (err: any) {
    return educationErrorResponse(err, 'Failed to fetch education resource');
  }
}
