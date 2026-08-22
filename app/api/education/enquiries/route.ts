/**
 * /api/education/enquiries
 *  GET  — inbox of education help requests (education:manage)
 *         ?status= ?resourceId= ?mobile= ?limit= ?offset=
 *  POST — a student/parent asks for help with a scheme. Public: no login
 *         required, but an authenticated submission is linked to the profile.
 */
import { NextResponse } from 'next/server';
import { createEnquiry, listEnquiries, toNumericId } from '@/src/lib/education/service';
import { educationErrorResponse } from '@/src/lib/education/response';
import { formatEducationEnquiry } from '@/src/lib/apiResponse';
import { validateRequestBody, educationEnquiryCreateSchema } from '@/src/lib/validations';
import { requireAuth, authenticateRequest } from '@/src/lib/jwtAuth';
import { resolveVillageId } from '@/src/lib/villageContext';
import { getRequestLimit } from '@/src/lib/requestParams';
import { logAuditAction } from '@/src/lib/authUtils';

const ENQUIRY_STATUSES = ['new', 'in_progress', 'resolved', 'closed', 'all'] as const;

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req, 'education:manage');
    if (!auth.success) return auth.response;

    const url = new URL(req.url);
    const offsetRaw = Number(url.searchParams.get('offset'));
    const villageId = await resolveVillageId(req);

    // Same reason as the content filters: an unknown enum label reaching the
    // WHERE clause is a 500 rather than an empty list.
    const requestedStatus = url.searchParams.get('status');
    const status = ENQUIRY_STATUSES.includes(requestedStatus as any)
      ? (requestedStatus as any)
      : 'all';

    const enquiries = await listEnquiries({
      villageId,
      status,
      resourceId: toNumericId(url.searchParams.get('resourceId')),
      mobile: url.searchParams.get('mobile') || undefined,
      limit: getRequestLimit(req),
      offset: Number.isFinite(offsetRaw) && offsetRaw > 0 ? offsetRaw : undefined,
    });

    return NextResponse.json({
      success: true,
      enquiries: enquiries.map(formatEducationEnquiry),
    });
  } catch (err: any) {
    return educationErrorResponse(err, 'Failed to fetch education enquiries');
  }
}

export async function POST(req: Request) {
  try {
    const validation = await validateRequestBody(req, educationEnquiryCreateSchema);
    if (!validation.success) return validation.response;

    // Optional identity — the enquiry is accepted either way.
    const auth = await authenticateRequest(req);
    const userId = auth.success === true ? auth.user.id : undefined;

    // Anonymous submissions still need a village to land in, or they show up
    // in no admin inbox — resolveVillageId falls back to the default chapter.
    const villageId =
      toNumericId(validation.data.villageId) ??
      (auth.success === true ? toNumericId(auth.user.villageId) : undefined) ??
      (await resolveVillageId(req));

    const created = await createEnquiry({ ...validation.data, villageId }, userId);

    logAuditAction(
      `New Education Enquiry from ${created.name}`,
      created.name,
      created.mobile,
      created.message.slice(0, 120)
    );

    return NextResponse.json(
      { success: true, enquiry: formatEducationEnquiry(created) },
      { status: 201 }
    );
  } catch (err: any) {
    return educationErrorResponse(err, 'Failed to submit education enquiry');
  }
}
