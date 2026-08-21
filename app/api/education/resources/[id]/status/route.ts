/**
 * PATCH /api/education/resources/[id]/status
 * Moves a resource through draft → pending → published → archived.
 * Requires education:publish, matching how the other modules gate publishing.
 */
import { NextResponse } from 'next/server';
import { setResourceStatus } from '@/src/lib/education/service';
import { educationErrorResponse } from '@/src/lib/education/response';
import { formatEducationResource } from '@/src/lib/apiResponse';
import { educationStatusSchema } from '@/src/lib/validations';
import { requireAuth } from '@/src/lib/jwtAuth';
import { logAuditAction } from '@/src/lib/authUtils';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req, 'education:publish');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id } = await params;
    const body = await req.json().catch(() => ({} as any));

    const parsed = educationStatusSchema.safeParse(body.status);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'status must be one of draft, pending, published, archived.' },
        { status: 400 }
      );
    }

    const updated = await setResourceStatus(id, parsed.data);

    logAuditAction(
      `Updated Education Resource status to "${parsed.data}" (${updated.title})`,
      body.adminName || currentUser.name || 'Admin',
      body.adminMobile || currentUser.mobile || '',
      updated.slug
    );

    return NextResponse.json({ success: true, resource: formatEducationResource(updated) });
  } catch (err: any) {
    return educationErrorResponse(err, 'Failed to update education resource status');
  }
}
