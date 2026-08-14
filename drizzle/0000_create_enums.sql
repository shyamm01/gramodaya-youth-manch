CREATE TYPE "public"."role_scope" AS ENUM('GLOBAL', 'STATE', 'DISTRICT', 'GRAM_PANCHAYAT', 'VILLAGE');--> statement-breakpoint
CREATE TYPE "public"."system_role" AS ENUM('SUPER_ADMIN', 'DISTRICT_ADMIN', 'PANCHAYAT_ADMIN', 'VILLAGE_ADMIN', 'VILLAGE_MODERATOR', 'MEMBER', 'GUEST');--> statement-breakpoint
CREATE TYPE "public"."member_status" AS ENUM('active', 'pending', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('MEMBER', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."complaint_category" AS ENUM('Water', 'Road', 'Electricity', 'Cleanliness', 'Environment', 'Education', 'Health', 'Sanitation', 'Animal-related', 'Social Issue', 'Government Service', 'Other');--> statement-breakpoint
CREATE TYPE "public"."complaint_status" AS ENUM('NEW', 'ACTION IN PROGRESS', 'RESOLVED');--> statement-breakpoint
CREATE TYPE "public"."social_work_status" AS ENUM('pending', 'approved', 'published');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('DRAFT', 'PENDING', 'PUBLISHED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."gallery_status" AS ENUM('pending', 'published');--> statement-breakpoint
CREATE TYPE "public"."public_info_status" AS ENUM('pending', 'approved', 'rejected');
