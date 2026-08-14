export type RoleScope = 'GLOBAL' | 'VILLAGE';

export type SystemRole = 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';

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

export interface UserPermission {
  id: string;
  userId: string;
  permissionCode: PermissionCode;
  scopeType: RoleScope;
  scopeId?: string | null;
  isGranted: boolean;
  grantedBy?: string;
  createdAt: string;
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
  districtId: string;
  name: string;
  nameHindi: string;
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
  stateId?: string;
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
}

export interface Member {
  id: string;
  villageId?: string;
  name: string;
  mobile: string;
  status: 'active' | 'pending' | 'suspended';
  photoUrl?: string;
  createdAt: string;
  organizationName?: string;
  fatherName?: string;
  dob?: string;
  address?: string;
  occupation?: string;
  designation?: string;
  politicalBackground?: string;
  bloodGroup?: string;
  role?: SystemRole | 'MEMBER' | 'ADMIN';
  systemRole?: SystemRole;
  supabaseUserId?: string;
}

export interface ChatMessage {
  id: string;
  senderMobile: string;
  senderName: string;
  recipientMobile: string;
  recipientName: string;
  text: string;
  createdAt: string;
  read: boolean;
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

export interface Complaint {
  id: string;
  villageId?: string;
  title: string;
  category: ComplaintCategory;
  description: string;
  location: string;
  reporterName: string;
  reporterMobile: string;
  status: ComplaintStatus;
  photoUrl?: string;
  videoUrl?: string;
  isDemo?: boolean;
  createdAt: string;
  resolvedAt?: string;
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
  permissions?: PermissionCode[];
  accessibleVillages?: string[];
  activeVillageId?: string;
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
  tagline?: string;
  taglineHindi: string;
  slogan?: string;
  sloganHindi: string;
  orgName: string;
  orgNameHindi: string;
  orgPurposeHindi: string;
}
