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
// 1. ENUMS (प्रकार / विकल्प - Canonical Enums)
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
// 2. GEOGRAPHY & CHAPTER HIERARCHY TABLES (3NF Normalized)
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
  (table) => [
    uniqueIndex('idx_states_code').on(table.code),
    index('idx_states_name').on(table.name),
  ]
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
    nameHindi: text('name_hindi'),
    blockName: text('block_name').default('Hardoi'),
    blockNameHindi: text('block_name_hindi').default('हरदोई'),
    pincode: text('pincode').default('241125'),
    postOffice: text('post_office').default('Bahera Rasoolpur'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_gram_panchayats_district_id').on(table.districtId),
    index('idx_gram_panchayats_name').on(table.name),
    index('idx_gram_panchayats_pincode').on(table.pincode),
    index('idx_gram_panchayats_is_active').on(table.isActive),
  ]
);

/**
 * 2.4 VILLAGES / CHAPTERS (ग्राम इकाइयां - Multi-Tenant Hub)
 */
export const villages = pgTable(
  'villages',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    slug: text('slug').notNull().unique(), // e.g. 'rasoolpur'
    name: text('name').notNull(),
    nameHindi: text('name_hindi').notNull(),
    gramPanchayatId: bigint('gram_panchayat_id', { mode: 'number' })
      .notNull()
      .references(() => gramPanchayats.id, { onDelete: 'restrict' }),
    blockName: text('block_name').default('Hardoi'),
    blockNameHindi: text('block_name_hindi').default('हरदोई'),
    pincode: text('pincode').default('241125'),
    postOffice: text('post_office').default('Bahera Rasoolpur'),
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
    index('idx_villages_name').on(table.name),
    index('idx_villages_panchayat_id').on(table.gramPanchayatId),
    index('idx_villages_pincode').on(table.pincode),
    index('idx_villages_is_active').on(table.isActive),
  ]
);

// ==============================================================================
// 3. PBAC PERMISSIONS & MEMBERS TABLE
// ==============================================================================

/**
 * 3.0 PROFILES (Supabase Auth उपयोगकर्ता प्रोफाइल)
 * Implements PRD Section 19: User Profile Data Model
 */
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

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
 * 3.2 MEMBERS TABLE (ग्राम सदस्य एवं पदाधिकारी)
 */
export const members = pgTable(
  'members',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' })
      .notNull()
      .references(() => villages.id, { onDelete: 'restrict' }),
    supabaseUserId: uuid('supabase_user_id'),
    name: text('name').notNull(),
    mobile: text('mobile').notNull().unique(),
    email: text('email'),
    passwordHash: text('password_hash'),
    status: memberStatusEnum('status').notNull().default('active'),
    photoUrl: text('photo_url'),
    fatherName: text('father_name'),
    dob: text('dob'),
    gender: text('gender'),
    address: text('address'),
    houseNo: text('house_no'),
    street: text('street'),
    pincode: text('pincode').default('241125'),
    occupation: text('occupation'),
    designation: text('designation'),
    politicalBackground: text('political_background'),
    bloodGroup: text('blood_group'),
    role: memberRoleEnum('role').notNull().default('MEMBER'),
    systemRole: systemRoleEnum('system_role').notNull().default('MEMBER'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_members_village_id').on(table.villageId),
    uniqueIndex('idx_members_mobile').on(table.mobile),
    index('idx_members_status').on(table.status),
    index('idx_members_system_role').on(table.systemRole),
    index('idx_members_created_at').on(table.createdAt),
  ]
);

/**
 * 3.3 USER PERMISSIONS (उपयोगकर्ता स्तर की व्यक्तिगत अनुमतियां - PBAC Overrides)
 */
export const userPermissions = pgTable(
  'user_permissions',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    memberId: bigint('member_id', { mode: 'number' })
      .notNull()
      .references(() => members.id, { onDelete: 'cascade' }),
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
    index('idx_user_permissions_member_id').on(table.memberId),
    index('idx_user_permissions_perm_code').on(table.permissionCode),
    index('idx_user_permissions_scope').on(table.scopeType, table.scopeId),
  ]
);

/**
 * 3.4 USER VILLAGE ROLES (ग्राम स्तर पर उपयोगकर्ता की भूमिका)
 */
export const userVillageRoles = pgTable(
  'user_village_roles',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    memberId: bigint('member_id', { mode: 'number' })
      .notNull()
      .references(() => members.id, { onDelete: 'cascade' }),
    villageId: bigint('village_id', { mode: 'number' })
      .notNull()
      .references(() => villages.id, { onDelete: 'cascade' }),
    role: systemRoleEnum('role').notNull().default('MEMBER'),
    isPrimary: boolean('is_primary').notNull().default(false),
    assignedBy: text('assigned_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_user_village_roles_member').on(table.memberId),
    index('idx_user_village_roles_village').on(table.villageId),
    index('idx_user_village_roles_role').on(table.role),
  ]
);

// ==============================================================================
// 4. DOMAIN ENTITY TABLES (Strict Foreign Keys & Timestamps)
// ==============================================================================

/**
 * 4.1 COMPLAINTS TABLE (ग्राम स्तर की समस्याएं)
 */
export const complaints = pgTable(
  'complaints',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' })
      .notNull()
      .references(() => villages.id, { onDelete: 'cascade' }),
    memberId: bigint('member_id', { mode: 'number' }).references(() => members.id, { onDelete: 'set null' }),
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
    index('idx_complaints_member_id').on(table.memberId),
    index('idx_complaints_status').on(table.status),
    index('idx_complaints_category').on(table.category),
    index('idx_complaints_created_at').on(table.createdAt),
  ]
);

/**
 * 4.2 SOCIAL WORKS TABLE (सामाजिक कार्य)
 */
export const socialWorks = pgTable(
  'social_works',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' })
      .notNull()
      .references(() => villages.id, { onDelete: 'cascade' }),
    memberId: bigint('member_id', { mode: 'number' }).references(() => members.id, { onDelete: 'set null' }),
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
    index('idx_social_works_member_id').on(table.memberId),
    index('idx_social_works_status').on(table.status),
    index('idx_social_works_date').on(table.date),
  ]
);

/**
 * 4.3 EVENTS TABLE (ग्राम कार्यक्रम)
 */
export const events = pgTable(
  'events',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' })
      .notNull()
      .references(() => villages.id, { onDelete: 'cascade' }),
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
 * 4.4 GALLERY TABLE (ग्राम चित्रशाला)
 */
export const gallery = pgTable(
  'gallery',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' })
      .notNull()
      .references(() => villages.id, { onDelete: 'cascade' }),
    caption: text('caption'),
    photoUrl: text('photo_url').notNull(),
    uploadedBy: text('uploaded_by').notNull().default('Admin'),
    uploadedByMobile: text('uploaded_by_mobile'),
    date: date('date').notNull().default(sql`CURRENT_DATE`),
    status: galleryStatusEnum('status').notNull().default('published'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_gallery_village_id').on(table.villageId),
    index('idx_gallery_status').on(table.status),
  ]
);

/**
 * 4.5 ELDERS TABLE (बुजुर्ग सम्मान सूची)
 */
export const elders = pgTable(
  'elders',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' })
      .notNull()
      .references(() => villages.id, { onDelete: 'cascade' }),
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
 * 4.6 ANNOUNCEMENTS TABLE (सार्वजनिक सूचनाएं)
 */
export const announcements = pgTable(
  'announcements',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' })
      .notNull()
      .references(() => villages.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    content: text('content').notNull(),
    publishedBy: text('published_by').notNull().default('ग्रामोदय यूथ मंच'),
    isUrgent: boolean('is_urgent').default(false),
    date: date('date').notNull().default(sql`CURRENT_DATE`),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_announcements_village_id').on(table.villageId),
    index('idx_announcements_is_urgent').on(table.isUrgent),
  ]
);

/**
 * 4.7 PUBLIC INFOS TABLE (नागरिक सूचनाएं)
 */
export const publicInfos = pgTable(
  'public_infos',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' })
      .notNull()
      .references(() => villages.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    category: text('category').notNull(),
    submitterName: text('submitter_name').notNull(),
    submitterMobile: text('submitter_mobile').notNull(),
    status: publicInfoStatusEnum('status').notNull().default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_public_infos_village_id').on(table.villageId),
    index('idx_public_infos_status').on(table.status),
  ]
);

/**
 * 4.8 GROUP MESSAGES TABLE (ग्राम लाइव चैट)
 */
export const groupMessages = pgTable(
  'group_messages',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' })
      .notNull()
      .references(() => villages.id, { onDelete: 'cascade' }),
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
 * 4.9 DIRECT MESSAGES TABLE
 */
export const messages = pgTable(
  'messages',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' })
      .notNull()
      .references(() => villages.id, { onDelete: 'cascade' }),
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
    index('idx_messages_village_id').on(table.villageId),
    index('idx_messages_room_id').on(table.roomId),
    index('idx_messages_created_at').on(table.createdAt),
  ]
);

/**
 * 4.10 AUDIT LOGS TABLE
 */
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' }).references(() => villages.id, { onDelete: 'set null' }),
    memberId: bigint('member_id', { mode: 'number' }).references(() => members.id, { onDelete: 'set null' }),
    userName: text('user_name').notNull(),
    action: text('action').notNull(),
    details: text('details'),
    ipAddress: text('ip_address'),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_audit_logs_village_id').on(table.villageId),
    index('idx_audit_logs_member_id').on(table.memberId),
    index('idx_audit_logs_timestamp').on(table.timestamp),
  ]
);

// ==============================================================================
// 5. RELATIONS (3NF Relational Integrity & Graph Traversal)
// ==============================================================================

export const statesRelations = relations(states, ({ many }) => ({
  districts: many(districts),
}));

export const districtsRelations = relations(districts, ({ one, many }) => ({
  state: one(states, {
    fields: [districts.stateId],
    references: [states.id],
  }),
  gramPanchayats: many(gramPanchayats),
}));

export const gramPanchayatsRelations = relations(gramPanchayats, ({ one, many }) => ({
  district: one(districts, {
    fields: [gramPanchayats.districtId],
    references: [districts.id],
  }),
  villages: many(villages),
}));

export const villagesRelations = relations(villages, ({ one, many }) => ({
  gramPanchayat: one(gramPanchayats, {
    fields: [villages.gramPanchayatId],
    references: [gramPanchayats.id],
  }),
  members: many(members),
  complaints: many(complaints),
  socialWorks: many(socialWorks),
  events: many(events),
  gallery: many(gallery),
  elders: many(elders),
  announcements: many(announcements),
  publicInfos: many(publicInfos),
  groupMessages: many(groupMessages),
  messages: many(messages),
  userVillageRoles: many(userVillageRoles),
  auditLogs: many(auditLogs),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  userPermissions: many(userPermissions),
}));

export const userPermissionsRelations = relations(userPermissions, ({ one }) => ({
  permission: one(permissions, {
    fields: [userPermissions.permissionCode],
    references: [permissions.code],
  }),
  member: one(members, {
    fields: [userPermissions.memberId],
    references: [members.id],
  }),
}));

export const userVillageRolesRelations = relations(userVillageRoles, ({ one }) => ({
  member: one(members, {
    fields: [userVillageRoles.memberId],
    references: [members.id],
  }),
  village: one(villages, {
    fields: [userVillageRoles.villageId],
    references: [villages.id],
  }),
}));

export const membersRelations = relations(members, ({ one, many }) => ({
  village: one(villages, {
    fields: [members.villageId],
    references: [villages.id],
  }),
  userPermissions: many(userPermissions),
  villageRoles: many(userVillageRoles),
  complaints: many(complaints),
  socialWorks: many(socialWorks),
  auditLogs: many(auditLogs),
}));

export const complaintsRelations = relations(complaints, ({ one }) => ({
  village: one(villages, {
    fields: [complaints.villageId],
    references: [villages.id],
  }),
  member: one(members, {
    fields: [complaints.memberId],
    references: [members.id],
  }),
}));

export const socialWorksRelations = relations(socialWorks, ({ one }) => ({
  village: one(villages, {
    fields: [socialWorks.villageId],
    references: [villages.id],
  }),
  member: one(members, {
    fields: [socialWorks.memberId],
    references: [members.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  village: one(villages, {
    fields: [events.villageId],
    references: [villages.id],
  }),
}));

export const galleryRelations = relations(gallery, ({ one }) => ({
  village: one(villages, {
    fields: [gallery.villageId],
    references: [villages.id],
  }),
}));

export const eldersRelations = relations(elders, ({ one }) => ({
  village: one(villages, {
    fields: [elders.villageId],
    references: [villages.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  village: one(villages, {
    fields: [announcements.villageId],
    references: [villages.id],
  }),
}));

export const publicInfosRelations = relations(publicInfos, ({ one }) => ({
  village: one(villages, {
    fields: [publicInfos.villageId],
    references: [villages.id],
  }),
}));

export const groupMessagesRelations = relations(groupMessages, ({ one }) => ({
  village: one(villages, {
    fields: [groupMessages.villageId],
    references: [villages.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  village: one(villages, {
    fields: [messages.villageId],
    references: [villages.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  village: one(villages, {
    fields: [auditLogs.villageId],
    references: [villages.id],
  }),
  member: one(members, {
    fields: [auditLogs.memberId],
    references: [members.id],
  }),
}));

// ==============================================================================
// 6. INFERRED TYPES
// ==============================================================================

export type State = typeof states.$inferSelect;
export type NewState = typeof states.$inferInsert;

export type District = typeof districts.$inferSelect;
export type NewDistrict = typeof districts.$inferInsert;

export type GramPanchayat = typeof gramPanchayats.$inferSelect;
export type NewGramPanchayat = typeof gramPanchayats.$inferInsert;

export type VillageModel = typeof villages.$inferSelect;
export type NewVillageModel = typeof villages.$inferInsert;

export type ProfileModel = typeof profiles.$inferSelect;
export type NewProfileModel = typeof profiles.$inferInsert;

export type PermissionModel = typeof permissions.$inferSelect;
export type NewPermissionModel = typeof permissions.$inferInsert;

export type UserPermissionModel = typeof userPermissions.$inferSelect;
export type NewUserPermissionModel = typeof userPermissions.$inferInsert;

export type UserVillageRoleModel = typeof userVillageRoles.$inferSelect;
export type NewUserVillageRoleModel = typeof userVillageRoles.$inferInsert;

export type MemberModel = typeof members.$inferSelect;
export type NewMemberModel = typeof members.$inferInsert;

export type ComplaintModel = typeof complaints.$inferSelect;
export type NewComplaintModel = typeof complaints.$inferInsert;

export type SocialWorkModel = typeof socialWorks.$inferSelect;
export type NewSocialWorkModel = typeof socialWorks.$inferInsert;

export type EventModel = typeof events.$inferSelect;
export type NewEventModel = typeof events.$inferInsert;

export type GalleryModel = typeof gallery.$inferSelect;
export type NewGalleryModel = typeof gallery.$inferInsert;

export type ElderModel = typeof elders.$inferSelect;
export type NewElderModel = typeof elders.$inferInsert;

export type AnnouncementModel = typeof announcements.$inferSelect;
export type NewAnnouncementModel = typeof announcements.$inferInsert;

export type PublicInfoModel = typeof publicInfos.$inferSelect;
export type NewPublicInfoModel = typeof publicInfos.$inferInsert;

export type GroupMessageModel = typeof groupMessages.$inferSelect;
export type NewGroupMessageModel = typeof groupMessages.$inferInsert;

export type MessageModel = typeof messages.$inferSelect;
export type NewMessageModel = typeof messages.$inferInsert;

export type AuditLogModel = typeof auditLogs.$inferSelect;
export type NewAuditLogModel = typeof auditLogs.$inferInsert;
