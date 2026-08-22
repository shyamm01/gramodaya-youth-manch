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
  integer,
  jsonb,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ==============================================================================
// 1. ENUMS (प्रकार / विकल्प - Canonical Enums)
// ==============================================================================
export const roleScopeEnum = pgEnum('role_scope', [
  'GLOBAL',
  'STATE',
  'DISTRICT',
  'GRAM_PANCHAYAT',
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

/**
 * Education module enums. Kept deliberately generic so new kinds of education
 * content can be added without a schema change beyond a new enum value.
 */
export const educationScopeEnum = pgEnum('education_scope', [
  'gramodaya', // the Manch's own programme
  'government', // central / state government scheme
]);

export const educationStatusEnum = pgEnum('education_status', [
  'draft',
  'pending',
  'published',
  'archived',
]);

export const educationResourceTypeEnum = pgEnum('education_resource_type', [
  'scheme',
  'scholarship',
  'course',
  'institution',
  'guidance',
  'resource',
  'other',
]);

export const educationLinkTypeEnum = pgEnum('education_link_type', [
  'portal',
  'pdf',
  'video',
  'form',
  'contact',
  'other',
]);

export const educationEnquiryStatusEnum = pgEnum('education_enquiry_status', [
  'new',
  'in_progress',
  'resolved',
  'closed',
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
    nameHindi: text('name_hindi').notNull(),
    blockName: text('block_name'),
    blockNameHindi: text('block_name_hindi'),
    pincode: text('pincode'),
    postOffice: text('post_office'),
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
      .references(() => gramPanchayats.id, { onDelete: 'set null' }),
    blockName: text('block_name'),
    blockNameHindi: text('block_name_hindi'),
    pincode: text('pincode'),
    postOffice: text('post_office'),
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
// 3. PROFILES & PBAC PERMISSIONS (Unified User / Member Architecture)
// ==============================================================================

/**
 * 3.0 PROFILES (Unified User & Member Model)
 */
export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey(),
    fullName: text('full_name').notNull(),
    avatarUrl: text('avatar_url'),
    mobile: text('mobile'),
    email: text('email'),
    fatherName: text('father_name'),
    dob: text('dob'),
    gender: text('gender'),
    villageId: bigint('village_id', { mode: 'number' })
      .references(() => villages.id, { onDelete: 'set null' }),
    houseNo: text('house_no'),
    street: text('street'),
    pincode: text('pincode'),
    occupation: text('occupation'),
    designation: text('designation'),
    politicalBackground: text('political_background'),
    bloodGroup: text('blood_group'),
    status: memberStatusEnum('status').notNull().default('pending'),
    role: memberRoleEnum('role').notNull().default('MEMBER'),
    systemRole: systemRoleEnum('system_role').notNull().default('MEMBER'),
    isApproved: boolean('is_approved').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_profiles_created_at').on(table.createdAt),
    index('idx_profiles_mobile').on(table.mobile),
    index('idx_profiles_status').on(table.status),
    index('idx_profiles_system_role').on(table.systemRole),
    index('idx_profiles_village_id').on(table.villageId),
  ]
);

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
    userId: uuid('user_id')
      .references(() => profiles.id, { onDelete: 'cascade' }),
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
    userId: uuid('user_id')
      .references(() => profiles.id, { onDelete: 'cascade' }),
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
      .references(() => villages.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => profiles.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    category: complaintCategoryEnum('category').notNull().default('Other'),
    description: text('description').notNull(),
    location: text('location').notNull(),
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
    index('idx_complaints_user_id').on(table.userId),
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
      .references(() => villages.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => profiles.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    date: date('date').notNull().default(sql`CURRENT_DATE`),
    location: text('location').notNull(),
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
    index('idx_social_works_user_id').on(table.userId),
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
      .references(() => villages.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    date: text('date').notNull(),
    time: text('time').notNull(),
    location: text('location').notNull(),
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
      .references(() => villages.id, { onDelete: 'cascade' }),
    caption: text('caption'),
    photoUrl: text('photo_url').notNull(),
    uploadedBy: text('uploaded_by').notNull(),
    uploadedByMobile: text('uploaded_by_mobile'),
    date: date('date').notNull(),
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
      .references(() => villages.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    age: text('age').notNull(),
    role: text('role'),
    contribution: text('contribution'),
    photoUrl: text('photo_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_elders_village_id').on(table.villageId),
    index('idx_elders_name').on(table.name),
  ]
);

/**
 * 4.6 ANNOUNCEMENTS TABLE (ग्राम घोषणाएं एवं सूचनाएं)
 */
export const announcements = pgTable(
  'announcements',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' })
      .references(() => villages.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    content: text('content').notNull(),
    date: date('date').notNull().default(sql`CURRENT_DATE`),
    publishedBy: text('published_by').notNull().default('Admin'),
    isUrgent: boolean('is_urgent').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_announcements_village_id').on(table.villageId),
    index('idx_announcements_date').on(table.date),
    index('idx_announcements_is_urgent').on(table.isUrgent),
  ]
);

/**
 * 4.7 PUBLIC INFORMATIONS TABLE (सार्वजनिक सूचना एवं सुझाव)
 */
export const publicInfos = pgTable(
  'public_infos',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' })
      .references(() => villages.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    category: text('category').notNull().default('General'),
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
 * 4.8 EDUCATION MODULE (शिक्षा)
 *
 * Structure mirrors what the education pages render, but as data:
 *   education_categories  →  education_resources  →  education_resource_links
 * plus education_enquiries for citizens asking for help with a scheme.
 *
 * Extensibility notes:
 *  - villageId is nullable: NULL rows are platform-wide content shared by every
 *    village chapter, a non-NULL row belongs to that one village only.
 *  - The *Key columns hold i18n keys (e.g. "education.nsp.title") so the seeded
 *    content keeps using the existing locale files, while admin-created rows
 *    simply store literal title/description text instead.
 *  - metadata (jsonb) absorbs new per-item fields without a migration.
 */
export const educationCategories = pgTable(
  'education_categories',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' })
      .references(() => villages.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    nameHindi: text('name_hindi'),
    nameKey: text('name_key'),
    overview: text('overview'),
    overviewHindi: text('overview_hindi'),
    overviewKey: text('overview_key'),
    icon: text('icon').notNull().default('GraduationCap'),
    displayOrder: integer('display_order').notNull().default(0),
    status: educationStatusEnum('status').notNull().default('published'),
    metadata: jsonb('metadata').$type<Record<string, any>>(),
    createdBy: uuid('created_by').references(() => profiles.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_education_categories_village_slug').on(table.villageId, table.slug),
    // Postgres treats NULLs as distinct in a unique index, so platform-wide
    // categories (village_id IS NULL) need their own partial unique index.
    uniqueIndex('idx_education_categories_global_slug')
      .on(table.slug)
      .where(sql`village_id IS NULL`),
    index('idx_education_categories_village_id').on(table.villageId),
    index('idx_education_categories_status').on(table.status),
    index('idx_education_categories_display_order').on(table.displayOrder),
  ]
);

/**
 * 4.8.2 EDUCATION RESOURCES (योजनाएं, छात्रवृत्ति, मार्गदर्शन)
 * One card on an education category page — a scheme, scholarship, course,
 * institution or guidance item.
 */
export const educationResources = pgTable(
  'education_resources',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    categoryId: bigint('category_id', { mode: 'number' })
      .notNull()
      .references(() => educationCategories.id, { onDelete: 'cascade' }),
    villageId: bigint('village_id', { mode: 'number' })
      .references(() => villages.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    titleHindi: text('title_hindi'),
    titleKey: text('title_key'),
    description: text('description'),
    descriptionHindi: text('description_hindi'),
    descriptionKey: text('description_key'),
    icon: text('icon').notNull().default('BookOpen'),
    scope: educationScopeEnum('scope').notNull().default('government'),
    type: educationResourceTypeEnum('type').notNull().default('scheme'),
    status: educationStatusEnum('status').notNull().default('published'),
    // Long-form detail fields — all optional, so a minimal card
    // (title + description) is still a valid record.
    eligibility: text('eligibility'),
    benefits: text('benefits'),
    howToApply: text('how_to_apply'),
    documentsRequired: jsonb('documents_required').$type<string[]>(),
    // Hindi twins for the long-form fields. The village site defaults to Hindi,
    // so detail text that exists only in English would be the wrong language for
    // most of its readers; null falls back to the English column.
    eligibilityHindi: text('eligibility_hindi'),
    benefitsHindi: text('benefits_hindi'),
    howToApplyHindi: text('how_to_apply_hindi'),
    documentsRequiredHindi: jsonb('documents_required_hindi').$type<string[]>(),
    tags: jsonb('tags').$type<string[]>(),
    provider: text('provider'),
    providerHindi: text('provider_hindi'),
    externalUrl: text('external_url'),
    photoUrl: text('photo_url'),
    contactName: text('contact_name'),
    contactMobile: text('contact_mobile'),
    startDate: date('start_date'),
    endDate: date('end_date'),
    // Label on the card's action button. Null means the UI keeps its own
    // translated default ("Learn more"), so a row that says nothing about it
    // reads correctly in both languages; set it per row to say something more
    // specific ("Apply now", "Check eligibility").
    ctaLabel: text('cta_label'),
    ctaLabelHindi: text('cta_label_hindi'),
    displayOrder: integer('display_order').notNull().default(0),
    metadata: jsonb('metadata').$type<Record<string, any>>(),
    createdBy: uuid('created_by').references(() => profiles.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_education_resources_category_slug').on(table.categoryId, table.slug),
    index('idx_education_resources_category_id').on(table.categoryId),
    index('idx_education_resources_village_id').on(table.villageId),
    index('idx_education_resources_status').on(table.status),
    index('idx_education_resources_scope').on(table.scope),
    index('idx_education_resources_type').on(table.type),
    index('idx_education_resources_display_order').on(table.displayOrder),
  ]
);

/**
 * 4.8.3 EDUCATION RESOURCE LINKS
 * Apply-here portals, PDFs, videos and forms attached to a resource.
 */
export const educationResourceLinks = pgTable(
  'education_resource_links',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    resourceId: bigint('resource_id', { mode: 'number' })
      .notNull()
      .references(() => educationResources.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    labelHindi: text('label_hindi'),
    url: text('url').notNull(),
    type: educationLinkTypeEnum('type').notNull().default('portal'),
    displayOrder: integer('display_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_education_resource_links_resource_id').on(table.resourceId),
    index('idx_education_resource_links_display_order').on(table.displayOrder),
  ]
);

/**
 * 4.8.4 EDUCATION ENQUIRIES (शिक्षा सहायता अनुरोध)
 * A student/parent asking for help with a scheme — the "Learn more" CTA that
 * currently points at the helpline.
 */
export const educationEnquiries = pgTable(
  'education_enquiries',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' })
      .references(() => villages.id, { onDelete: 'cascade' }),
    resourceId: bigint('resource_id', { mode: 'number' })
      .references(() => educationResources.id, { onDelete: 'set null' }),
    categoryId: bigint('category_id', { mode: 'number' })
      .references(() => educationCategories.id, { onDelete: 'set null' }),
    userId: uuid('user_id').references(() => profiles.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    mobile: text('mobile').notNull(),
    email: text('email'),
    studentClass: text('student_class'),
    message: text('message').notNull(),
    status: educationEnquiryStatusEnum('status').notNull().default('new'),
    assignedTo: uuid('assigned_to').references(() => profiles.id, { onDelete: 'set null' }),
    response: text('response'),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_education_enquiries_village_id').on(table.villageId),
    index('idx_education_enquiries_resource_id').on(table.resourceId),
    index('idx_education_enquiries_status').on(table.status),
    index('idx_education_enquiries_mobile').on(table.mobile),
    index('idx_education_enquiries_created_at').on(table.createdAt),
  ]
);

// ==============================================================================
// 5. REALTIME CHAT & MESSAGING TABLES
// ==============================================================================

/**
 * 5.1 CHAT ROOMS TABLE
 */
export const chatRooms = pgTable(
  'chat_rooms',
  {
    id: text('id').primaryKey(), // e.g. 'general', 'direct_userId1_userId2'
    name: text('name').notNull(),
    type: text('type').notNull().default('group'), // 'group', 'direct', 'village'
    villageId: bigint('village_id', { mode: 'number' })
      .references(() => villages.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_chat_rooms_village_id').on(table.villageId),
    index('idx_chat_rooms_type').on(table.type),
  ]
);

/**
 * 5.2 CHAT MEMBERS TABLE
 */
export const chatMembers = pgTable(
  'chat_members',
  {
    id: text('id').primaryKey(),
    roomId: text('room_id')
      .notNull()
      .references(() => chatRooms.id, { onDelete: 'cascade' }),
    memberId: text('member_id').notNull(),
    mobile: text('mobile').notNull(),
    name: text('name').notNull(),
    role: text('role').default('Member'),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
    lastReadAt: timestamp('last_read_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_chat_members_room_id').on(table.roomId),
    index('idx_chat_members_member_id').on(table.memberId),
    index('idx_chat_members_mobile').on(table.mobile),
  ]
);

/**
 * 5.3 CHAT MESSAGES TABLE
 */
export const chatMessages = pgTable(
  'chat_messages',
  {
    id: text('id').primaryKey(),
    roomId: text('room_id')
      .notNull()
      .references(() => chatRooms.id, { onDelete: 'cascade' }),
    villageId: bigint('village_id', { mode: 'number' })
      .references(() => villages.id, { onDelete: 'cascade' }),
    senderMobile: text('sender_mobile').notNull(),
    senderName: text('sender_name').notNull(),
    senderPhoto: text('sender_photo'),
    senderMemberId: text('sender_member_id'),
    text: text('text').notNull(),
    photoUrl: text('photo_url'),
    isRead: boolean('is_read').default(false),
    isDeleted: boolean('is_deleted').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_chat_messages_room_id').on(table.roomId),
    index('idx_chat_messages_village_id').on(table.villageId),
    index('idx_chat_messages_created_at').on(table.createdAt),
    index('idx_chat_messages_sender_mobile').on(table.senderMobile),
  ]
);

/**
 * 5.4 AUDIT LOGS TABLE
 */
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    villageId: bigint('village_id', { mode: 'number' }).references(() => villages.id, { onDelete: 'set null' }),
    userId: uuid('user_id').references(() => profiles.id, { onDelete: 'set null' }),
    userName: text('user_name').notNull(),
    action: text('action').notNull(),
    details: text('details'),
    ipAddress: text('ip_address'),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_audit_logs_village_id').on(table.villageId),
    index('idx_audit_logs_user_id').on(table.userId),
    index('idx_audit_logs_timestamp').on(table.timestamp),
  ]
);

// ==============================================================================
// 6. RELATIONS (3NF Relational Integrity & Graph Traversal)
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
  profiles: many(profiles),
  complaints: many(complaints),
  socialWorks: many(socialWorks),
  events: many(events),
  gallery: many(gallery),
  elders: many(elders),
  announcements: many(announcements),
  publicInfos: many(publicInfos),
  chatRooms: many(chatRooms),
  chatMessages: many(chatMessages),
  userVillageRoles: many(userVillageRoles),
  auditLogs: many(auditLogs),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  village: one(villages, {
    fields: [profiles.villageId],
    references: [villages.id],
  }),
  complaints: many(complaints),
  socialWorks: many(socialWorks),
  userPermissions: many(userPermissions),
  villageRoles: many(userVillageRoles),
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
  user: one(profiles, {
    fields: [userPermissions.userId],
    references: [profiles.id],
  }),
}));

export const userVillageRolesRelations = relations(userVillageRoles, ({ one }) => ({
  user: one(profiles, {
    fields: [userVillageRoles.userId],
    references: [profiles.id],
  }),
  village: one(villages, {
    fields: [userVillageRoles.villageId],
    references: [villages.id],
  }),
}));

export const complaintsRelations = relations(complaints, ({ one }) => ({
  village: one(villages, {
    fields: [complaints.villageId],
    references: [villages.id],
  }),
  user: one(profiles, {
    fields: [complaints.userId],
    references: [profiles.id],
  }),
}));

export const socialWorksRelations = relations(socialWorks, ({ one }) => ({
  village: one(villages, {
    fields: [socialWorks.villageId],
    references: [villages.id],
  }),
  user: one(profiles, {
    fields: [socialWorks.userId],
    references: [profiles.id],
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

export const educationCategoriesRelations = relations(educationCategories, ({ one, many }) => ({
  village: one(villages, {
    fields: [educationCategories.villageId],
    references: [villages.id],
  }),
  createdByProfile: one(profiles, {
    fields: [educationCategories.createdBy],
    references: [profiles.id],
  }),
  resources: many(educationResources),
  enquiries: many(educationEnquiries),
}));

export const educationResourcesRelations = relations(educationResources, ({ one, many }) => ({
  category: one(educationCategories, {
    fields: [educationResources.categoryId],
    references: [educationCategories.id],
  }),
  village: one(villages, {
    fields: [educationResources.villageId],
    references: [villages.id],
  }),
  createdByProfile: one(profiles, {
    fields: [educationResources.createdBy],
    references: [profiles.id],
  }),
  links: many(educationResourceLinks),
  enquiries: many(educationEnquiries),
}));

export const educationResourceLinksRelations = relations(educationResourceLinks, ({ one }) => ({
  resource: one(educationResources, {
    fields: [educationResourceLinks.resourceId],
    references: [educationResources.id],
  }),
}));

export const educationEnquiriesRelations = relations(educationEnquiries, ({ one }) => ({
  village: one(villages, {
    fields: [educationEnquiries.villageId],
    references: [villages.id],
  }),
  resource: one(educationResources, {
    fields: [educationEnquiries.resourceId],
    references: [educationResources.id],
  }),
  category: one(educationCategories, {
    fields: [educationEnquiries.categoryId],
    references: [educationCategories.id],
  }),
  user: one(profiles, {
    fields: [educationEnquiries.userId],
    references: [profiles.id],
  }),
  assignee: one(profiles, {
    fields: [educationEnquiries.assignedTo],
    references: [profiles.id],
  }),
}));

export const chatRoomsRelations = relations(chatRooms, ({ one, many }) => ({
  village: one(villages, {
    fields: [chatRooms.villageId],
    references: [villages.id],
  }),
  members: many(chatMembers),
  messages: many(chatMessages),
}));

export const chatMembersRelations = relations(chatMembers, ({ one }) => ({
  room: one(chatRooms, {
    fields: [chatMembers.roomId],
    references: [chatRooms.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  room: one(chatRooms, {
    fields: [chatMessages.roomId],
    references: [chatRooms.id],
  }),
  village: one(villages, {
    fields: [chatMessages.villageId],
    references: [villages.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  village: one(villages, {
    fields: [auditLogs.villageId],
    references: [villages.id],
  }),
  user: one(profiles, {
    fields: [auditLogs.userId],
    references: [profiles.id],
  }),
}));

// ==============================================================================
// 7. INFERRED TYPES
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

export type EducationCategoryModel = typeof educationCategories.$inferSelect;
export type NewEducationCategoryModel = typeof educationCategories.$inferInsert;

export type EducationResourceModel = typeof educationResources.$inferSelect;
export type NewEducationResourceModel = typeof educationResources.$inferInsert;

export type EducationResourceLinkModel = typeof educationResourceLinks.$inferSelect;
export type NewEducationResourceLinkModel = typeof educationResourceLinks.$inferInsert;

export type EducationEnquiryModel = typeof educationEnquiries.$inferSelect;
export type NewEducationEnquiryModel = typeof educationEnquiries.$inferInsert;

export type ChatRoomModel = typeof chatRooms.$inferSelect;
export type NewChatRoomModel = typeof chatRooms.$inferInsert;

export type ChatMemberModel = typeof chatMembers.$inferSelect;
export type NewChatMemberModel = typeof chatMembers.$inferInsert;

export type ChatMessageModel = typeof chatMessages.$inferSelect;
export type NewChatMessageModel = typeof chatMessages.$inferInsert;

export type AuditLogModel = typeof auditLogs.$inferSelect;
export type NewAuditLogModel = typeof auditLogs.$inferInsert;

// ==============================================================================
// 8. BACKWARD COMPATIBILITY ALIASES
// ==============================================================================
export const members = profiles;
export const groupMessages = chatMessages;
export const messages = chatMessages;

export type MemberModel = ProfileModel;
export type NewMemberModel = NewProfileModel;
export type GroupMessageModel = ChatMessageModel;
export type NewGroupMessageModel = NewChatMessageModel;
export type MessageModel = ChatMessageModel;
export type NewMessageModel = NewChatMessageModel;

