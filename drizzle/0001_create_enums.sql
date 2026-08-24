-- ============================================================================
-- 0001 · ENUM TYPES (canonical domains)
-- ----------------------------------------------------------------------------
-- Every enumerated domain in the schema is declared here once. gym_sync_enum()
-- reconciles a type that already exists with the wrong label set, so this file
-- is the single place any enum value is added or corrected.
--
-- Deliberately NOT re-created here (both are dropped in 0028):
--   member_role       — profiles.role duplicated profiles.system_role
--   complaint_category — complaints.category duplicated complaints.category_id
-- ============================================================================

-- Governance / identity -------------------------------------------------------
SELECT gym_sync_enum('role_scope',
  ARRAY['GLOBAL', 'STATE', 'DISTRICT', 'GRAM_PANCHAYAT', 'VILLAGE']);
--> statement-breakpoint
SELECT gym_sync_enum('system_role',
  ARRAY['SUPER_ADMIN', 'ADMIN', 'MEMBER']);
--> statement-breakpoint
SELECT gym_sync_enum('member_status',
  ARRAY['active', 'pending', 'suspended']);
--> statement-breakpoint

-- Grievance redressal ---------------------------------------------------------
SELECT gym_sync_enum('complaint_status',
  ARRAY['NEW', 'ACTION IN PROGRESS', 'RESOLVED']);
--> statement-breakpoint
SELECT gym_sync_enum('complaint_priority',
  ARRAY['low', 'medium', 'high', 'urgent']);
--> statement-breakpoint
SELECT gym_sync_enum('complaint_attachment_type',
  ARRAY['photo', 'video', 'document']);
--> statement-breakpoint

-- Community content -----------------------------------------------------------
SELECT gym_sync_enum('social_work_status',
  ARRAY['pending', 'approved', 'published']);
--> statement-breakpoint
-- NOTE: the original 0000 shipped this as ('upcoming','completed','cancelled')
-- while the application had already moved to the DRAFT..CANCELLED lifecycle and
-- kept events.status as untyped text to dodge the mismatch. gym_sync_enum
-- rebuilds the type with the correct labels; 0015 then casts the column.
SELECT gym_sync_enum('event_status',
  ARRAY['DRAFT', 'PENDING', 'PUBLISHED', 'COMPLETED', 'CANCELLED']);
--> statement-breakpoint
SELECT gym_sync_enum('gallery_status',
  ARRAY['pending', 'published']);
--> statement-breakpoint
SELECT gym_sync_enum('public_info_status',
  ARRAY['pending', 'approved', 'rejected']);
--> statement-breakpoint

-- Education module ------------------------------------------------------------
SELECT gym_sync_enum('education_scope',
  ARRAY['gramodaya', 'government']);
--> statement-breakpoint
SELECT gym_sync_enum('education_status',
  ARRAY['draft', 'pending', 'published', 'archived']);
--> statement-breakpoint
SELECT gym_sync_enum('education_resource_type',
  ARRAY['scheme', 'scholarship', 'course', 'institution', 'guidance', 'resource', 'other']);
--> statement-breakpoint
SELECT gym_sync_enum('education_link_type',
  ARRAY['portal', 'pdf', 'video', 'form', 'contact', 'other']);
--> statement-breakpoint
SELECT gym_sync_enum('education_enquiry_status',
  ARRAY['new', 'in_progress', 'resolved', 'closed']);
--> statement-breakpoint

-- Realtime chat ---------------------------------------------------------------
SELECT gym_sync_enum('chat_room_type',
  ARRAY['group', 'direct', 'village']);
--> statement-breakpoint
SELECT gym_sync_enum('chat_member_role',
  ARRAY['member', 'moderator', 'admin']);
