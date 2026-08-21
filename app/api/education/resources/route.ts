/**
 * /api/education/resources
 *  GET  — filterable list of schemes / scholarships / guidance items
 *         ?category=<slug> ?categoryId= ?scope= ?type= ?tag= ?q= ?limit= ?offset=
 *  POST — create a resource under a category (education:manage)
 */
import { NextResponse } from 'next/server';
import { countResources, createResource, listResources } from '@/src/lib/education/service';
import { parseResourceFilters, resolveEducationScope } from '@/src/lib/education/params';
import { educationErrorResponse } from '@/src/lib/education/response';
import { formatEducationResource } from '@/src/lib/apiResponse';
import { validateRequestBody, educationResourceCreateSchema } from '@/src/lib/validations';
import { requireAuth } from '@/src/lib/jwtAuth';
import { logAuditAction } from '@/src/lib/authUtils';

export async function GET(req: Request) {
  try {
    const scope = await resolveEducationScope(req);
    const filters = parseResourceFilters(req, scope);

    const [resources, total] = await Promise.all([
      listResources(filters),
      countResources(filters),
    ]);

    return NextResponse.json({
      success: true,
      resources: resources.map(formatEducationResource),
      meta: { total, limit: filters.limit, offset: filters.offset ?? 0 },
    });
  } catch (err: any) {
    return educationErrorResponse(err, 'Failed to fetch education resources');
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req, 'education:manage');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const validation = await validateRequestBody(req, educationResourceCreateSchema);
    if (!validation.success) return validation.response;

    const created = await createResource(validation.data, currentUser.id, currentUser as any);

    logAuditAction(
      `Created Education Resource: ${created.title}`,
      validation.data.adminName || currentUser.name || 'Admin',
      validation.data.adminMobile || currentUser.mobile || '',
      created.slug
    );

    return NextResponse.json(
      { success: true, resource: formatEducationResource(created) },
      { status: 201 }
    );
  } catch (err: any) {
    return educationErrorResponse(err, 'Failed to create education resource');
  }
}
