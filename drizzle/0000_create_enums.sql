DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_scope') THEN
        CREATE TYPE "public"."role_scope" AS ENUM('GLOBAL', 'STATE', 'DISTRICT', 'GRAM_PANCHAYAT', 'VILLAGE');
    END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'system_role') THEN
        CREATE TYPE "public"."system_role" AS ENUM('SUPER_ADMIN', 'ADMIN', 'MEMBER');
    END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_status') THEN
        CREATE TYPE "public"."member_status" AS ENUM('active', 'pending', 'suspended');
    END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_role') THEN
        CREATE TYPE "public"."member_role" AS ENUM('MEMBER', 'ADMIN');
    END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'complaint_category') THEN
        CREATE TYPE "public"."complaint_category" AS ENUM('Water', 'Road', 'Electricity', 'Cleanliness', 'Environment', 'Education', 'Health', 'Sanitation', 'Animal-related', 'Social Issue', 'Government Service', 'Other');
    END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'complaint_status') THEN
        CREATE TYPE "public"."complaint_status" AS ENUM('NEW', 'ACTION IN PROGRESS', 'RESOLVED');
    END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'social_work_status') THEN
        CREATE TYPE "public"."social_work_status" AS ENUM('pending', 'approved', 'published');
    END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
        CREATE TYPE "public"."event_status" AS ENUM('DRAFT', 'PENDING', 'PUBLISHED', 'COMPLETED', 'CANCELLED');
    END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gallery_status') THEN
        CREATE TYPE "public"."gallery_status" AS ENUM('pending', 'published');
    END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'public_info_status') THEN
        CREATE TYPE "public"."public_info_status" AS ENUM('pending', 'approved', 'rejected');
    END IF;
END $$;
