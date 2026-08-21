/**
 * /api/education/resources/[id]   (numeric id or slug)
 *  GET    — one resource with its links
 *  PUT    — full update (education:manage); a `links` array replaces the stored set
 *  PATCH  — partial update, same handler
 *  DELETE — remove the resource and its links (education:publish)
 */
import { NextResponse } from 'next/server';
import { deleteResource, getResource, updateResource } from '@/src/lib/education/service';
import { resolveEducationScope } from '@/src/lib/education/params';
import { educationErrorResponse } from '@/src/lib/education/response';
import { formatEducationResource } from '@/src/lib/apiResponse';
import { validateRequestBody, educationResourceUpdateSchema } from '@/src/lib/validations';
import { requireAuth } from '@/src/lib/jwtAuth';
import { logAuditAction } from '@/src/lib/authUtils';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const scope = await resolveEducationScope(req);

    const resource = await getResource(id, { status: scope.status, includeLinks: true });
    if (!resource) {
      return NextResponse.json(
        { success: false, error: 'Education resource not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, resource: formatEducationResource(resource) });
  } catch (err: any) {
    return educationErrorResponse(err, 'Failed to fetch education resource');
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req, 'education:manage');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id } = await params;
    const validation = await validateRequestBody(req, educationResourceUpdateSchema);
    if (!validation.success) return validation.response;

    const updated = await updateResource(id, validation.data);

    logAuditAction(
      `Updated Education Resource: ${updated.title}`,
      validation.data.adminName || currentUser.name || 'Admin',
      validation.data.adminMobile || currentUser.mobile || '',
      updated.slug
    );

    return NextResponse.json({ success: true, resource: formatEducationResource(updated) });
  } catch (err: any) {
    return educationErrorResponse(err, 'Failed to update education resource');
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  return PUT(req, props);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req, 'education:publish');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id } = await params;
    const body = await req.json().catch(() => ({} as any));

    const deleted = await deleteResource(id);

    logAuditAction(
      `Deleted Education Resource: ${deleted.title}`,
      body.adminName || currentUser.name || 'Admin',
      body.adminMobile || currentUser.mobile || '',
      deleted.slug
    );

    return NextResponse.json({ success: true, resource: formatEducationResource(deleted) });
  } catch (err: any) {
    return educationErrorResponse(err, 'Failed to delete education resource');
  }
}
