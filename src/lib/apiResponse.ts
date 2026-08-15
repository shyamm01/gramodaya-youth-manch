import { NextResponse } from 'next/server';

/**
 * Standardized API success response envelope
 */
export function apiSuccess<T>(data: T, meta?: Record<string, any>, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    { status }
  );
}

/**
 * Standardized API error response envelope
 */
export function apiError(message: string, status = 500, errors?: any[]) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(errors ? { errors } : {}),
    },
    { status }
  );
}

/**
 * Transformer: Village Model -> Standardized DTO
 */
export function formatVillage(v: any) {
  if (!v) return null;
  const gp = v.gramPanchayat;
  const dist = gp?.district;
  const st = dist?.state;

  return {
    id: String(v.id),
    slug: v.slug,
    name: v.name,
    nameHindi: v.nameHindi,
    gramPanchayatId: v.gramPanchayatId ? String(v.gramPanchayatId) : undefined,
    gramPanchayatName: gp?.name || 'Bahera',
    gramPanchayatNameHindi: gp?.nameHindi || 'बहेरा',
    districtId: dist ? String(dist.id) : undefined,
    districtName: dist?.name || 'Hardoi',
    districtNameHindi: dist?.nameHindi || 'हरदोई',
    stateId: st ? String(st.id) : undefined,
    stateName: st?.name || 'Uttar Pradesh',
    stateNameHindi: st?.nameHindi || 'उत्तर प्रदेश',
    blockName: v.blockName || gp?.blockName || 'Hardoi',
    blockNameHindi: v.blockNameHindi || gp?.blockNameHindi || 'हरदोई',
    pincode: v.pincode || gp?.pincode || '241125',
    postOffice: v.postOffice || gp?.postOffice || 'Bahera Rasoolpur',
    orgName: v.orgName,
    orgNameHindi: v.orgNameHindi,
    sloganHindi: v.sloganHindi,
    taglineHindi: v.taglineHindi,
    orgPurposeHindi: v.orgPurposeHindi,
    contactMobile: v.contactMobile,
    contactEmail: v.contactEmail,
    bannerPhotoUrl: v.bannerPhotoUrl,
    isActive: v.isActive,
    createdAt: v.createdAt ? new Date(v.createdAt).toISOString() : undefined,
    updatedAt: v.updatedAt ? new Date(v.updatedAt).toISOString() : undefined,
  };
}

/**
 * Transformer: Member Model -> Standardized DTO
 */
export function formatMember(m: any) {
  if (!m) return null;
  const v = m.village;
  const gp = v?.gramPanchayat;
  const dist = gp?.district;
  const st = dist?.state;

  return {
    id: String(m.id),
    villageId: m.villageId ? String(m.villageId) : '1',
    name: m.name,
    mobile: m.mobile,
    email: m.email || '',
    status: m.status,
    photoUrl: m.photoUrl || '',
    organizationName: v?.orgNameHindi || v?.orgName || 'ग्रामोदय यूथ मंच',
    fatherName: m.fatherName || '',
    dob: m.dob || '',
    gender: m.gender || '',
    address: m.address || '',
    pincode: m.pincode || v?.pincode || gp?.pincode || '241125',
    state: st?.name || 'Uttar Pradesh',
    district: dist?.name || 'Hardoi',
    block: v?.blockName || gp?.blockName || 'Hardoi',
    gramPanchayat: gp?.name || 'Bahera',
    villageName: v?.name || 'Rasoolpur',
    postOffice: v?.postOffice || gp?.postOffice || 'Bahera Rasoolpur',
    houseNo: m.houseNo || '',
    street: m.street || '',
    occupation: m.occupation || '',
    designation: m.designation || '',
    politicalBackground: m.politicalBackground || '',
    bloodGroup: m.bloodGroup || '',
    role: m.role || 'MEMBER',
    systemRole: m.systemRole || 'MEMBER',
    createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : undefined,
  };
}

/**
 * Transformer: Complaint Model -> Standardized DTO
 */
export function formatComplaint(c: any) {
  if (!c) return null;
  return {
    id: String(c.id),
    villageId: c.villageId ? String(c.villageId) : '1',
    memberId: c.memberId ? String(c.memberId) : undefined,
    title: c.title,
    category: c.category,
    description: c.description,
    location: c.location,
    reporterName: c.reporterName,
    reporterMobile: c.reporterMobile,
    status: c.status,
    photoUrl: c.photoUrl || '',
    videoUrl: c.videoUrl || '',
    isDemo: c.isDemo || false,
    resolvedAt: c.resolvedAt ? new Date(c.resolvedAt).toISOString() : undefined,
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : undefined,
  };
}

/**
 * Transformer: Social Work Model -> Standardized DTO
 */
export function formatSocialWork(s: any) {
  if (!s) return null;
  return {
    id: String(s.id),
    villageId: s.villageId ? String(s.villageId) : '1',
    memberId: s.memberId ? String(s.memberId) : undefined,
    title: s.title,
    description: s.description,
    date: s.date,
    location: s.location,
    submitterName: s.submitterName,
    submitterMobile: s.submitterMobile,
    photoUrl: s.photoUrl || '',
    videoUrl: s.videoUrl || '',
    status: s.status,
    createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : undefined,
  };
}

/**
 * Transformer: Event Model -> Standardized DTO
 */
export function formatEvent(e: any) {
  if (!e) return null;
  return {
    id: String(e.id),
    villageId: e.villageId ? String(e.villageId) : '1',
    title: e.title,
    name: e.title,
    description: e.description || '',
    date: e.date,
    time: e.time,
    location: e.location,
    photoUrl: e.photoUrl || '',
    videoUrl: e.videoUrl || '',
    status: e.status,
    createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : undefined,
  };
}

/**
 * Transformer: Gallery Model -> Standardized DTO
 */
export function formatGallery(g: any) {
  if (!g) return null;
  return {
    id: String(g.id),
    villageId: g.villageId ? String(g.villageId) : '1',
    caption: g.caption || '',
    photoUrl: g.photoUrl,
    uploadedBy: g.uploadedBy,
    uploadedByMobile: g.uploadedByMobile || '',
    date: g.date,
    status: g.status,
    createdAt: g.createdAt ? new Date(g.createdAt).toISOString() : undefined,
  };
}

/**
 * Transformer: Elder Model -> Standardized DTO
 */
export function formatElder(el: any) {
  if (!el) return null;
  return {
    id: String(el.id),
    villageId: el.villageId ? String(el.villageId) : '1',
    name: el.name,
    age: el.age || '',
    role: el.role || '',
    contribution: el.contribution || '',
    photoUrl: el.photoUrl || '',
    createdAt: el.createdAt ? new Date(el.createdAt).toISOString() : undefined,
  };
}

/**
 * Transformer: Announcement Model -> Standardized DTO
 */
export function formatAnnouncement(a: any) {
  if (!a) return null;
  return {
    id: String(a.id),
    villageId: a.villageId ? String(a.villageId) : '1',
    title: a.title,
    content: a.content,
    publishedBy: a.publishedBy,
    isUrgent: a.isUrgent || false,
    date: a.date,
    createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : undefined,
  };
}

/**
 * Transformer: Public Info Model -> Standardized DTO
 */
export function formatPublicInfo(p: any) {
  if (!p) return null;
  return {
    id: String(p.id),
    villageId: p.villageId ? String(p.villageId) : '1',
    title: p.title,
    description: p.description,
    category: p.category,
    submitterName: p.submitterName,
    submitterMobile: p.submitterMobile,
    status: p.status,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
  };
}

/**
 * Transformer: Group Message Model -> Standardized DTO
 */
export function formatGroupMessage(gm: any) {
  if (!gm) return null;
  return {
    id: String(gm.id),
    villageId: gm.villageId ? String(gm.villageId) : '1',
    senderName: gm.senderName,
    senderRole: gm.senderRole || 'Member',
    senderMobile: gm.senderMobile || '',
    senderPhoto: gm.senderPhoto || '',
    text: gm.text,
    timestamp: gm.timestamp,
    createdAt: gm.createdAt ? new Date(gm.createdAt).toISOString() : undefined,
  };
}

/**
 * Transformer: Audit Log Model -> Standardized DTO
 */
export function formatAuditLog(al: any) {
  if (!al) return null;
  return {
    id: String(al.id),
    villageId: al.villageId ? String(al.villageId) : undefined,
    memberId: al.memberId ? String(al.memberId) : undefined,
    action: al.action,
    adminName: al.userName,
    adminMobile: '',
    recordAffected: al.details || '',
    timestamp: al.timestamp ? new Date(al.timestamp).toISOString() : undefined,
  };
}
