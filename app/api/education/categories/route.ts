/**
 * /api/education/categories
 *  GET  — list categories (public: published only) with a resource count
 *  POST — create a category (education:manage)
 */
import { NextResponse } from 'next/server';
import { createCategory, listCategories } from '@/src/lib/education/service';
import { resolveEducationScope } from '@/src/lib/education/params';
import { educationErrorResponse } from '@/src/lib/education/response';
import { formatEducationCategory } from '@/src/lib/apiResponse';
import { validateRequestBody, educationCategoryCreateSchema } from '@/src/lib/validations';
import { requireAuth } from '@/src/lib/jwtAuth';
import { logAuditAction } from '@/src/lib/authUtils';

export async function GET(req: Request) {
  try {
    const scope = await resolveEducationScope(req);
    const categories = await listCategories({
      villageId: scope.villageId,
      includeGlobal: scope.includeGlobal,
      status: scope.status,
    });

    return NextResponse.json({
      success: true,
      categories: categories.map(formatEducationCategory),
    });
  } catch (err: any) {
    return educationErrorResponse(err, 'Failed to fetch education categories');
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req, 'education:manage');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const validation = await validateRequestBody(req, educationCategoryCreateSchema);
    if (!validation.success) return validation.response;

    const created = await createCategory(validation.data, currentUser.id);

    logAuditAction(
      `Created Education Category: ${created.name}`,
      validation.data.adminName || currentUser.name || 'Admin',
      validation.data.adminMobile || currentUser.mobile || '',
      created.slug
    );

    return NextResponse.json(
      { success: true, category: formatEducationCategory(created) },
      { status: 201 }
    );
  } catch (err: any) {
    return educationErrorResponse(err, 'Failed to create education category');
  }
}
