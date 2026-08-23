export type RoleScope = 'GLOBAL' | 'STATE' | 'DISTRICT' | 'GRAM_PANCHAYAT' | 'VILLAGE';

export type SystemRole = 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';

export type MemberRole = 'MEMBER' | 'ADMIN';
export type MemberStatus = 'active' | 'pending' | 'suspended';

export type PermissionCode =
  | 'village:manage'
  | 'village:settings:update'
  | 'members:view'
  | 'members:create'
  | 'members:approve'
  | 'members:update'
  | 'members:delete'
  | 'members:roles:assign'
  | 'permissions:manage'
  | 'complaints:view'
  | 'complaints:create'
  | 'complaints:update'
  | 'complaints:resolve'
  | 'complaints:delete'
  | 'social_works:manage'
  | 'social_works:publish'
  | 'events:manage'
  | 'events:publish'
  | 'gallery:upload'
  | 'gallery:moderate'
  | 'announcements:publish'
  | 'announcements:global_broadcast'
  | 'public_info:manage'
  | 'elders:manage'
  | 'education:view'
  | 'education:manage'
  | 'education:publish'
  | 'chat:participate'
  | 'chat:moderate'
  | 'audit:view'
  | 'integrations:manage';

export interface Permission {
  code: PermissionCode;
  name: string;
  module: string;
  description?: string;
}

export interface ModuleItem {
  id: string | number;
  slug: string;
  name: string;
  nameHindi: string;
  icon: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface UserModulePermission {
  id?: string | number;
  userId?: string;
  moduleId: string | number;
  moduleSlug: string;
  moduleName: string;
  moduleNameHindi: string;
  icon?: string;
  description?: string;
  canRead: boolean;
  canWrite: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  scopeType?: RoleScope;
  scopeId?: string | number | null;
  isCustom?: boolean;
}

export interface UserPermission {
  id: string;
  userId: string;
  permissionCode?: PermissionCode;
  moduleId?: string | number;
  canRead?: boolean;
  canWrite?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  scopeType: RoleScope;
  scopeId?: string | null;
  isGranted?: boolean;
  grantedBy?: string;
  createdAt?: string;
}

export interface UserVillageRole {
  id: string;
  userId: string;
  villageId: string;
  role: SystemRole;
  isPrimary: boolean;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
}

export interface StateRegion {
  id: string;
  name: string;
  nameHindi: string;
  code: string;
}

export interface District {
  id: string;
  stateId: string;
  name: string;
  nameHindi: string;
}

export interface GramPanchayat {
  id: string;
  districtId?: string;
  districtName?: string;
  districtNameHindi?: string;
  stateId?: string;
  stateName?: string;
  stateNameHindi?: string;
  name: string;
  nameHindi?: string;
  blockName?: string;
  blockNameHindi?: string;
  pincode?: string;
  postOffice?: string;
  isActive?: boolean;
}

export interface Village {
  id: string;
  slug: string;
  name: string;
  nameHindi: string;
  gramPanchayatId?: string;
  gramPanchayatName?: string;
  gramPanchayatNameHindi?: string;
  districtId?: string;
  districtName?: string;
  districtNameHindi?: string;
  stateId?: string;
  stateName?: string;
  stateNameHindi?: string;
  blockName?: string;
  blockNameHindi?: string;
  pincode?: string;
  postOffice?: string;
  orgName: string;
  orgNameHindi: string;
  sloganHindi?: string;
  taglineHindi?: string;
  orgPurposeHindi?: string;
  contactMobile?: string;
  contactEmail?: string;
  bannerPhotoUrl?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupMessage {
  id: string;
  villageId?: string;
  senderName: string;
  senderMobile?: string;
  senderPhoto?: string;
  text: string;
  createdAt: string;
  isOnline?: boolean;
}

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';

export interface Admin {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  role: string;
  systemRole?: SystemRole;
  scopeType?: RoleScope;
  scopeId?: string;
  village: string;
  villageId?: string;
  gramPanchayat: string;
  photoUrl?: string;
  isHead: boolean;
  hasPasswordSet?: boolean;
  permissions?: PermissionCode[];
}

export interface Member {
  id: string;
  villageId?: string;
  name: string;
  mobile: string;
  email?: string;
  passwordHash?: string;
  status: 'active' | 'pending' | 'suspended';
  photoUrl?: string;
  createdAt: string;
  organizationName?: string;
  fatherName?: string;
  dob?: string;
  gender?: string;
  address?: string;
  pincode?: string;
  state?: string;
  district?: string;
  block?: string;
  gramPanchayat?: string;
  villageName?: string;
  postOffice?: string;
  houseNo?: string;
  street?: string;
  occupation?: string;
  designation?: string;
  politicalBackground?: string;
  bloodGroup?: string;
  role?: SystemRole | 'MEMBER' | 'ADMIN';
  systemRole?: SystemRole;
  supabaseUserId?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'group' | 'personal' | 'admin';
  villageId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatRoomMember {
  id: string;
  roomId: string;
  memberId: string;
  mobile: string;
  name: string;
  role: 'admin' | 'member';
  joinedAt?: string;
  lastReadAt?: string;
}

export interface ChatMessage {
  id: string;
  roomId?: string;
  villageId?: string;
  senderMobile: string;
  senderName: string;
  senderPhoto?: string;
  senderMemberId?: string;
  recipientMobile?: string;
  recipientName?: string;
  text: string;
  photoUrl?: string;
  createdAt: string;
  read?: boolean;
  isRead?: boolean;
  isDeleted?: boolean;
}

export type ComplaintCategory =
  | 'Water'
  | 'Road'
  | 'Electricity'
  | 'Cleanliness'
  | 'Environment'
  | 'Education'
  | 'Health'
  | 'Sanitation'
  | 'Animal-related'
  | 'Social Issue'
  | 'Government Service'
  | 'Other';

export type ComplaintStatus = 'NEW' | 'ACTION IN PROGRESS' | 'RESOLVED';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ComplaintAttachmentType = 'photo' | 'video' | 'document';

export interface ComplaintCategoryItem {
  id: string;
  slug: string;
  name: string;
  nameHindi: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ComplaintAttachment {
  id: string;
  complaintId: string;
  type: ComplaintAttachmentType;
  url: string;
  caption?: string;
  createdAt: string;
}

export interface ComplaintStatusHistoryEntry {
  id: string;
  complaintId: string;
  fromStatus?: string | null;
  toStatus: string;
  changedBy?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface Complaint {
  id: string;
  villageId?: string;
  villageName?: string;
  villageNameHindi?: string;
  village?: {
    id: string;
    name: string;
    nameHindi: string;
    slug?: string;
  } | null;
  categoryId?: string;
  title: string;
  titleHindi?: string;
  category: ComplaintCategory;
  description: string;
  descriptionHindi?: string;
  location: string;
  locationHindi?: string;
  ward?: string;
  wardHindi?: string;
  reporterName: string;
  reporterMobile: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  /** @deprecated Use attachments array */
  photoUrl?: string;
  /** @deprecated Use attachments array */
  videoUrl?: string;
  attachments?: ComplaintAttachment[];
  statusHistory?: ComplaintStatusHistoryEntry[];
  categoryRef?: ComplaintCategoryItem;
  isActive?: boolean;
  createdAt: string;
  resolvedAt?: string;
  updatedAt?: string;
}

export interface SocialWork {
  id: string;
  villageId?: string;
  title: string;
  description: string;
  date: string;
  location: string;
  submitterName: string;
  submitterMobile: string;
  photoUrl?: string;
  videoUrl?: string;
  status: 'pending' | 'approved' | 'published';
  createdAt: string;
}

export interface PublicInfo {
  id: string;
  villageId?: string;
  name: string;
  mobile: string;
  information: string;
  photoUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Announcement {
  id: string;
  villageId?: string | null;
  title: string;
  content: string;
  publishedBy: string;
  date: string;
  createdAt: string;
}

export type EventStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';

export interface EventItem {
  id: string;
  villageId?: string;
  name?: string; // alias for title
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  photoUrl?: string;
  videoUrl?: string;
  status: EventStatus;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  villageId?: string;
  caption?: string;
  photoUrl: string;
  uploadedBy: string;
  date: string;
  status?: 'pending' | 'published';
  createdAt: string;
}

export interface Elder {
  id: string;
  villageId?: string;
  name: string;
  mobile?: string;
  location: string;
  details?: string;
  photoUrl?: string;
  createdAt: string;
}

export type EducationScope = 'gramodaya' | 'government';
export type EducationStatus = 'draft' | 'pending' | 'published' | 'archived';
export type EducationResourceType =
  | 'scheme'
  | 'scholarship'
  | 'course'
  | 'institution'
  | 'guidance'
  | 'resource'
  | 'other';
export type EducationLinkType = 'portal' | 'pdf' | 'video' | 'form' | 'contact' | 'other';
export type EducationEnquiryStatus = 'new' | 'in_progress' | 'resolved' | 'closed';

export interface EducationResourceLink {
  id: string;
  resourceId: string;
  label: string;
  labelHindi?: string;
  url: string;
  type: EducationLinkType;
  displayOrder: number;
}

export interface EducationResource {
  id: string;
  categoryId: string;
  categorySlug?: string;
  villageId?: string;
  slug: string;
  title: string;
  titleHindi?: string;
  /** i18n key for seeded content, e.g. "education.nsp.title" */
  titleKey?: string;
  description?: string;
  descriptionHindi?: string;
  descriptionKey?: string;
  /** lucide-react icon name, resolved to a component on the client */
  icon: string;
  scope: EducationScope;
  type: EducationResourceType;
  status: EducationStatus;
  eligibility?: string;
  benefits?: string;
  howToApply?: string;
  documentsRequired?: string[];
  eligibilityHindi?: string;
  benefitsHindi?: string;
  howToApplyHindi?: string;
  documentsRequiredHindi?: string[];
  tags?: string[];
  provider?: string;
  providerHindi?: string;
  externalUrl?: string;
  photoUrl?: string;
  contactName?: string;
  contactMobile?: string;
  startDate?: string;
  endDate?: string;
  /** Label for the card's action button; empty falls back to "Learn more". */
  ctaLabel?: string;
  ctaLabelHindi?: string;
  displayOrder: number;
  metadata?: Record<string, any>;
  links?: EducationResourceLink[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EducationCategory {
  id: string;
  villageId?: string;
  slug: string;
  name: string;
  nameHindi?: string;
  nameKey?: string;
  overview?: string;
  overviewHindi?: string;
  overviewKey?: string;
  icon: string;
  displayOrder: number;
  status: EducationStatus;
  metadata?: Record<string, any>;
  resourceCount?: number;
  resources?: EducationResource[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EducationEnquiry {
  id: string;
  villageId?: string;
  resourceId?: string;
  categoryId?: string;
  userId?: string;
  name: string;
  mobile: string;
  email?: string;
  studentClass?: string;
  message: string;
  status: EducationEnquiryStatus;
  assignedTo?: string;
  response?: string;
  resolvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  villageId?: string;
  action: string;
  adminName: string;
  adminMobile: string;
  recordAffected: string;
  timestamp: string;
}

export interface ApiIntegration {
  id: string;
  villageId?: string;
  name: string;
  category?: 'database' | 'auth' | 'storage' | 'communication' | 'analytics' | string;
  status: 'connected' | 'disconnected' | 'error' | 'Connected' | 'Not Connected' | string;
  keyMasked?: string;
  config?: Record<string, string>;
  updatedAt?: string;
  lastSyncedAt?: string;
}

export interface AppStats {
  totalMembers?: number;
  actualMembers?: number;
  pendingMembers?: number;
  totalComplaints?: number;
  actualProblems?: number;
  newProblems?: number;
  inProgressProblems?: number;
  resolvedComplaints?: number;
  resolvedProblems?: number;
  pendingComplaints?: number;
  totalSocialWorks?: number;
  publishedSocialWork?: number;
  pendingSocialWork?: number;
  pendingInformation?: number;
  publishedInformation?: number;
  totalEvents?: number;
  upcomingEvents?: number;
  totalGallery?: number;
  galleryPhotos?: number;
  totalElders?: number;
  eldersCount?: number;
  totalVillages?: number;
}

export interface AuthSession {
  isAdminLoggedIn: boolean;
  isMemberLoggedIn?: boolean;
  adminUser?: Admin | null;
  adminId?: string;
  adminName?: string;
  adminMobile?: string;
  currentMember?: Member | null;
  currentMemberId?: string;
  currentMemberName?: string;
  currentMemberMobile?: string;
  currentMemberPhoto?: string;
  supabaseUserId?: string;
  email?: string;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
  systemRole?: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
  token?: string;
  permissions?: PermissionCode[];
  accessibleVillages?: string[];
  activeVillageId?: string;
  adminVillageId?: string;
}

export interface VillageSettings {
  id?: string;
  slug?: string;
  name: string;
  nameHindi: string;
  gramPanchayat: string;
  gramPanchayatHindi: string;
  district?: string;
  districtHindi?: string;
  state?: string;
  stateHindi?: string;
  block?: string;
  blockHindi?: string;
  pincode?: string;
  postOffice?: string;
  tagline?: string;
  taglineHindi: string;
  slogan?: string;
  sloganHindi: string;
  orgName: string;
  orgNameHindi: string;
  orgPurposeHindi: string;
}
