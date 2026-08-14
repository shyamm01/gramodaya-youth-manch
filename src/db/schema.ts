import {
  pgTable,
  bigserial,
  bigint,
  text,
  timestamp,
  boolean,
  date,
  uuid,
  index,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ==============================================================================
// 1. ENUMS (प्रकार / विकल्प - 3 Canonical Roles)
// ==============================================================================
export const roleScopeEnum = pgEnum('role_scope', [
  'GLOBAL',
  'VILLAGE',
]);

export const systemRoleEnum = pgEnum('system_role', [
  'SUPER_ADMIN',
  'ADMIN',
  'MEMBER',
]);

export const memberStatusEnum = pgEnum('member_status', ['active', 'pending', 'suspended']);
export const memberRoleEnum = pgEnum('member_role', ['MEMBER', 'ADMIN']);

export const complaintCategoryEnum = pgEnum('complaint_category', [
  'Water',
  'Road',
  'Electricity',
  'Cleanliness',
  'Environment',
  'Education',
  'Health',
  'Sanitation',
  'Animal-related',
  'Social Issue',
  'Government Service',
  'Other',
]);

export const complaintStatusEnum = pgEnum('complaint_status', [
  'NEW',
  'ACTION IN PROGRESS',
  'RESOLVED',
]);

export const socialWorkStatusEnum = pgEnum('social_work_status', [
  'pending',
  'approved',
  'published',
]);

export const eventStatusEnum = pgEnum('event_status', [
  'DRAFT',
  'PENDING',
  'PUBLISHED',
  'COMPLETED',
  'CANCELLED',
]);

export const galleryStatusEnum = pgEnum('gallery_status', [
  'pending',
  'published',
]);

export const publicInfoStatusEnum = pgEnum('public_info_status', [
  'pending',
  'approved',
  'rejected',
]);

// ==============================================================================
// 2. GEOGRAPHY & MULTI-TENANCY TABLES (Auto-Increment IDs)
// ==============================================================================

/**
 * 2.1 STATES (राज्य)
 */
export const states = pgTable(
  'states',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: text('name').notNull(),
    nameHindi: text('name_hindi').notNull(),
    code: text('code').notNull().unique(), // e.g. 'UP'
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_states_code').on(table.code)]
);

/**
 * 2.2 DISTRICTS (जनपद / जिले)
 */
export const districts = pgTable(
  'districts',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    stateId: bigint('state_id', { mode: 'number' })
      .notNull()
      .references(() => states.id, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    nameHindi: text('name_hindi').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_districts_state_id').on(table.stateId),
    index('idx_districts_name').on(table.name),
  ]
);

/**
 * 2.3 GRAM PANCHAYATS (ग्राम पंचायतें)
 */
export const gramPanchayats = pgTable(
  'gram_panchayats',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    districtId: bigint('district_id', { mode: 'number' })
      .notNull()
      .references(() => districts.id, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    nameHindi: text('name_hindi').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_gram_panchayats_district_id').on(table.districtId),
    index('idx_gram_panchayats_name').on(table.name),
  ]
);

/**
 * 2.4 VILLAGES / CITIES (ग्राम एवं नगर इकाइयां - Multi-Tenant Hub)
 */
export const villages = pgTable(
  'villages',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    slug: text('slug').notNull().unique(), // e.g. 'rasoolpur'
    name: text('name').notNull(),
    nameHindi: text('name_hindi').notNull(),
    gramPanchayatId: bigint('gram_panchayat_id', { mode: 'number' }).references(() => gramPanchayats.id, {
      onDelete: 'set null',
    }),
    districtId: bigint('district_id', { mode: 'number' }).references(() => districts.id, {
      onDelete: 'set null',
    }),
    stateId: bigint('state_id', { mode: 'number' }).references(() => states.id, {
      onDelete: 'set null',
    }),
    orgName: text('org_name').notNull().default('Gramodaya Youth Manch'),
    orgNameHindi: text('org_name_hindi').notNull().default('ग्रामोदय यूथ मंच'),
    sloganHindi: text('slogan_hindi').default('युवा शक्ति • ग्राम विकास • उज्ज्वल भविष्य'),
    taglineHindi: text('tagline_hindi').default('युवा शक्ति से ग्रामोदय की ओर'),
    orgPurposeHindi: text('org_purpose_hindi'),
    contactMobile: text('contact_mobile'),
    contactEmail: text('contact_email'),
    bannerPhotoUrl: text('banner_photo_url'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_villages_slug').on(table.slug),
    index('idx_villages_panchayat_id').on(table.gramPanchayatId),
    index('idx_villages_district_id').on(table.districtId),
    index('idx_villages_is_active').on(table.isActive),
  ]
);

// ==============================================================================
// 3. PBAC PERMISSIONS & USER LEVEL ROLES (Auto-Increment IDs)
// ==============================================================================

/**
 * 3.1 PERMISSIONS (सिस्टम अनुमतियां)
 */
export const permissions = pgTable('permissions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  code: text('code').notNull().unique(), // e.g. 'complaints:view'
  name: text('name').notNull(),
  module: text('module').notNull(), // 'complaints', 'members', 'events', etc.
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * 3.2 USER PERMISSIONS (उपयोगकर्ता स्तर की व्यक्तिगत अनुमतियां - PBAC Overrides)
 */
export const userPermissions = pgTable(
  'user_permissions',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: bigint('user_id', { mode: 'number' }).notNull(),
    permissionCode: text('permission_code')
      .notNull()
      .references(() => permissions.code, { onDelete: 'cascade' }),
    scopeType: roleScopeEnum('scope_type').notNull().default('VILLAGE'),
    scopeId: bigint('scope_id', { mode: 'number' }),
    isGranted: boolean('is_granted').notNull().default(true),
    grantedBy: text('granted_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_user_permissions_user_id').on(table.userId),
    index('idx_user_permissions_perm_code').on(table.permissionCode),
    index('idx_user_permissions_scope').on(table.scopeType, table.scopeId),
  ]
);

/**
 * 3.3 USER VILLAGE ROLES (ग्राम स्तर पर उपयोगकर्ता की भूमिका)
 */
export const userVillageRoles = pgTable(
  'user_village_roles',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: bigint('user_id', { mode: 'number' }).notNull(),
    villageId: bigint('village_id', { mode: 'number' })
      .notNull()
      .references(() => villages.id, { onDelete: 'cascade' }),
    role: systemRoleEnum('role').notNull().default('MEMBER'),
    isPrimary: boolean('is_primary').notNull().default(false),
    assignedBy: text('assigned_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_user_village_roles_user').on(table.userId),
    index('idx_user_village_roles_village').on(table.villageId),
    index('idx_user_village_roles_role').on(table.role),
  ]
);

// ==============================================================================
// 4. DOMAIN ENTITY TABLES (Auto-Increment IDs)
// ==============================================================================

/**
 * 4.1 MEMBERS TABLE
 */
export const members = pgTable(
  'members',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' }).references(() => villages.id, { onDelete: 'set null' }),
    supabaseUserId: uuid('supabase_user_id'),
    name: text('name').notNull(),
    mobile: text('mobile').notNull().unique(),
    status: memberStatusEnum('status').notNull().default('active'),
    photoUrl: text('photo_url'),
    organizationName: text('organization_name').default('ग्रामोदय यूथ मंच'),
    fatherName: text('father_name'),
    dob: text('dob'),
    address: text('address').default('ग्राम रसूलपुर, ग्राम पंचायत बहेरा'),
    role: memberRoleEnum('role').notNull().default('MEMBER'),
    systemRole: systemRoleEnum('system_role').notNull().default('MEMBER'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_members_village_id').on(table.villageId),
    index('idx_members_mobile').on(table.mobile),
    index('idx_members_status').on(table.status),
    index('idx_members_system_role').on(table.systemRole),
    index('idx_members_created_at').on(table.createdAt),
  ]
);

/**
 * 4.2 COMPLAINTS TABLE (ग्राम स्तर की समस्याएं)
 */
export const complaints = pgTable(
  'complaints',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' }).references(() => villages.id, { onDelete: 'set null' }),
    userId: uuid('user_id'),
    title: text('title').notNull(),
    category: complaintCategoryEnum('category').notNull().default('Other'),
    description: text('description').notNull(),
    location: text('location').notNull().default('Rasoolpur'),
    reporterName: text('reporter_name').notNull(),
    reporterMobile: text('reporter_mobile').notNull(),
    status: complaintStatusEnum('status').notNull().default('NEW'),
    photoUrl: text('photo_url'),
    videoUrl: text('video_url'),
    isDemo: boolean('is_demo').default(false),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_complaints_village_id').on(table.villageId),
    index('idx_complaints_status').on(table.status),
    index('idx_complaints_category').on(table.category),
    index('idx_complaints_created_at').on(table.createdAt),
  ]
);

/**
 * 4.3 SOCIAL WORKS TABLE (सामाजिक कार्य)
 */
export const socialWorks = pgTable(
  'social_works',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' }).references(() => villages.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    date: date('date').notNull().default(sql`CURRENT_DATE`),
    location: text('location').notNull().default('Rasoolpur'),
    submitterName: text('submitter_name').notNull(),
    submitterMobile: text('submitter_mobile').notNull(),
    photoUrl: text('photo_url'),
    videoUrl: text('video_url'),
    status: socialWorkStatusEnum('status').notNull().default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_social_works_village_id').on(table.villageId),
    index('idx_social_works_status').on(table.status),
    index('idx_social_works_date').on(table.date),
  ]
);

/**
 * 4.4 EVENTS TABLE (ग्राम कार्यक्रम)
 */
export const events = pgTable(
  'events',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' }).references(() => villages.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    description: text('description'),
    date: text('date').notNull(),
    time: text('time').notNull().default('10:00 AM'),
    location: text('location').notNull().default('Rasoolpur Village'),
    photoUrl: text('photo_url'),
    videoUrl: text('video_url'),
    status: eventStatusEnum('status').notNull().default('PUBLISHED'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_events_village_id').on(table.villageId),
    index('idx_events_status').on(table.status),
  ]
);

/**
 * 4.5 GALLERY TABLE (ग्राम चित्रशाला)
 */
export const gallery = pgTable(
  'gallery',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' }).references(() => villages.id, { onDelete: 'set null' }),
    caption: text('caption'),
    photoUrl: text('photo_url').notNull(),
    uploadedBy: text('uploaded_by').notNull().default('Admin'),
    uploadedByMobile: text('uploaded_by_mobile'),
    date: date('date').notNull().default(sql`CURRENT_DATE`),
    status: galleryStatusEnum('status').notNull().default('published'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_gallery_village_id').on(table.villageId)]
);

/**
 * 4.6 ELDERS TABLE (बुजुर्ग सम्मान सूची)
 */
export const elders = pgTable(
  'elders',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' }).references(() => villages.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    age: text('age'),
    role: text('role'),
    contribution: text('contribution'),
    photoUrl: text('photo_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_elders_village_id').on(table.villageId)]
);

/**
 * 4.7 ANNOUNCEMENTS TABLE (सार्वजनिक सूचनाएं)
 */
export const announcements = pgTable(
  'announcements',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' }).references(() => villages.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    content: text('content').notNull(),
    publishedBy: text('published_by').notNull().default('ग्रामोदय यूथ मंच'),
    isUrgent: boolean('is_urgent').default(false),
    date: date('date').notNull().default(sql`CURRENT_DATE`),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_announcements_village_id').on(table.villageId)]
);

/**
 * 4.8 PUBLIC INFOS TABLE (नागरिक सूचनाएं)
 */
export const publicInfos = pgTable(
  'public_infos',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' }).references(() => villages.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    category: text('category').notNull(),
    submitterName: text('submitter_name').notNull(),
    submitterMobile: text('submitter_mobile').notNull(),
    status: publicInfoStatusEnum('status').notNull().default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_public_infos_village_id').on(table.villageId)]
);

/**
 * 4.9 GROUP MESSAGES TABLE (ग्राम लाइव चैट)
 */
export const groupMessages = pgTable(
  'group_messages',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' }).references(() => villages.id, { onDelete: 'set null' }),
    senderName: text('sender_name').notNull(),
    senderRole: text('sender_role').default('Member'),
    senderMobile: text('sender_mobile'),
    senderPhoto: text('sender_photo'),
    text: text('text').notNull(),
    timestamp: text('timestamp').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_group_messages_village_id').on(table.villageId),
    index('idx_group_messages_created_at').on(table.createdAt),
  ]
);

/**
 * 4.10 DIRECT MESSAGES TABLE
 */
export const messages = pgTable(
  'messages',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' }).references(() => villages.id, { onDelete: 'set null' }),
    roomId: text('room_id').default('general'),
    senderId: text('sender_id').notNull(),
    senderName: text('sender_name').notNull(),
    senderRole: text('sender_role').default('Member'),
    senderMobile: text('sender_mobile'),
    senderPhoto: text('sender_photo'),
    text: text('text').notNull(),
    photoUrl: text('photo_url'),
    timestamp: text('timestamp').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_messages_created_at').on(table.createdAt),
  ]
);

/**
 * 4.11 AUDIT LOGS TABLE
 */
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' }).references(() => villages.id, { onDelete: 'set null' }),
    userId: text('user_id'),
    userName: text('user_name').notNull(),
    action: text('action').notNull(),
    details: text('details'),
    ipAddress: text('ip_address'),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_audit_logs_village_id').on(table.villageId),
    index('idx_audit_logs_timestamp').on(table.timestamp),
  ]
);

// ==============================================================================
// 5. RELATIONS (संबंध)
// ==============================================================================

export const villagesRelations = relations(villages, ({ one, many }) => ({
  state: one(states, {
    fields: [villages.stateId],
    references: [states.id],
  }),
  district: one(districts, {
    fields: [villages.districtId],
    references: [districts.id],
  }),
  gramPanchayat: one(gramPanchayats, {
    fields: [villages.gramPanchayatId],
    references: [gramPanchayats.id],
  }),
  members: many(members),
  complaints: many(complaints),
  socialWorks: many(socialWorks),
  events: many(events),
  gallery: many(gallery),
  announcements: many(announcements),
  userVillageRoles: many(userVillageRoles),
}));

export const membersRelations = relations(members, ({ one, many }) => ({
  village: one(villages, {
    fields: [members.villageId],
    references: [villages.id],
  }),
  villageRoles: many(userVillageRoles),
}));

export const complaintsRelations = relations(complaints, ({ one }) => ({
  village: one(villages, {
    fields: [complaints.villageId],
    references: [villages.id],
  }),
}));
