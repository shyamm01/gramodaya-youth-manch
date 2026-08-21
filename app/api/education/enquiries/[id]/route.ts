/**
 * /api/education/enquiries/[id]
 *  PATCH  — assign, answer or move an enquiry's status (education:manage)
 *  DELETE — remove an enquiry (education:publish)
 */
import { NextResponse } from 'next/server';
import { deleteEnquiry, updateEnquiry } from '@/src/lib/education/service';
import { educationErrorResponse } from '@/src/lib/education/response';
import { formatEducationEnquiry } from '@/src/lib/apiResponse';
import { validateRequestBody, educationEnquiryUpdateSchema } from '@/src/lib/validations';
import { requireAuth } from '@/src/lib/jwtAuth';
import { logAuditAction } from '@/src/lib/authUtils';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req, 'education:manage');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id } = await params;
    const validation = await validateRequestBody(req, educationEnquiryUpdateSchema);
    if (!validation.success) return validation.response;

    const updated = await updateEnquiry(id, validation.data);

    logAuditAction(
      `Updated Education Enquiry #${updated.id} (${updated.status})`,
      validation.data.adminName || currentUser.name || 'Admin',
      validation.data.adminMobile || currentUser.mobile || '',
      updated.name
    );

    return NextResponse.json({ success: true, enquiry: formatEducationEnquiry(updated) });
  } catch (err: any) {
    return educationErrorResponse(err, 'Failed to update education enquiry');
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  return PATCH(req, props);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req, 'education:publish');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id } = await params;
    const body = await req.json().catch(() => ({} as any));

    const deleted = await deleteEnquiry(id);

    logAuditAction(
      `Deleted Education Enquiry #${deleted.id}`,
      body.adminName || currentUser.name || 'Admin',
      body.adminMobile || currentUser.mobile || '',
      deleted.name
    );

    return NextResponse.json({ success: true, enquiry: formatEducationEnquiry(deleted) });
  } catch (err: any) {
    return educationErrorResponse(err, 'Failed to delete education enquiry');
  }
}
