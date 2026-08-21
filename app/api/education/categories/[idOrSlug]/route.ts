/**
 * /api/education/categories/[idOrSlug]   (accepts a numeric id or the slug)
 *  GET    — one category with its resources
 *  PUT    — full update (education:manage)
 *  PATCH  — partial update, same handler
 *  DELETE — remove the category and, by cascade, its resources (education:publish)
 */
import { NextResponse } from 'next/server';
import {
  deleteCategory,
  getCategory,
  listResources,
  updateCategory,
} from '@/src/lib/education/service';
import { resolveEducationScope } from '@/src/lib/education/params';
import { educationErrorResponse } from '@/src/lib/education/response';
import { formatEducationCategory } from '@/src/lib/apiResponse';
import { validateRequestBody, educationCategoryUpdateSchema } from '@/src/lib/validations';
import { requireAuth } from '@/src/lib/jwtAuth';
import { logAuditAction } from '@/src/lib/authUtils';

export async function GET(req: Request, { params }: { params: Promise<{ idOrSlug: string }> }) {
  try {
    const { idOrSlug } = await params;
    const url = new URL(req.url);
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

    const resources = await listResources({
      categoryId: category.id,
      villageId: scope.villageId,
      includeGlobal: scope.includeGlobal,
      status: scope.status,
      includeLinks: url.searchParams.get('includeLinks') !== 'false',
    });

    return NextResponse.json({
      success: true,
      category: formatEducationCategory({ ...category, resources }),
    });
  } catch (err: any) {
    return educationErrorResponse(err, 'Failed to fetch education category');
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ idOrSlug: string }> }) {
  try {
    const auth = await requireAuth(req, 'education:manage');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { idOrSlug } = await params;
    const validation = await validateRequestBody(req, educationCategoryUpdateSchema);
    if (!validation.success) return validation.response;

    const updated = await updateCategory(idOrSlug, validation.data);

    logAuditAction(
      `Updated Education Category: ${updated.name}`,
      validation.data.adminName || currentUser.name || 'Admin',
      validation.data.adminMobile || currentUser.mobile || '',
      updated.slug
    );

    return NextResponse.json({ success: true, category: formatEducationCategory(updated) });
  } catch (err: any) {
    return educationErrorResponse(err, 'Failed to update education category');
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ idOrSlug: string }> }) {
  return PUT(req, props);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ idOrSlug: string }> }) {
  try {
    const auth = await requireAuth(req, 'education:publish');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { idOrSlug } = await params;
    const body = await req.json().catch(() => ({} as any));

    const deleted = await deleteCategory(idOrSlug);

    logAuditAction(
      `Deleted Education Category: ${deleted.name}`,
      body.adminName || currentUser.name || 'Admin',
      body.adminMobile || currentUser.mobile || '',
      deleted.slug
    );

    return NextResponse.json({ success: true, category: formatEducationCategory(deleted) });
  } catch (err: any) {
    return educationErrorResponse(err, 'Failed to delete education category');
  }
}
