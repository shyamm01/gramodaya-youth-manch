-- Migration: 0024_create_education_tables.sql
-- Education module: categories -> resources -> resource links, plus citizen enquiries.

-- Also brings role_scope in line with src/db/schema.ts: 0023 created the type
-- with only GLOBAL/VILLAGE while the schema declares the full hierarchy. Guarded
-- with IF NOT EXISTS so it is a no-op on databases that already have the values.
-- (Not wrapped in DO $$ … $$: Postgres refuses ALTER TYPE ... ADD VALUE from
-- inside a function or multi-command string.)
ALTER TYPE "public"."role_scope" ADD VALUE IF NOT EXISTS 'STATE' BEFORE 'VILLAGE';
--> statement-breakpoint
ALTER TYPE "public"."role_scope" ADD VALUE IF NOT EXISTS 'DISTRICT' BEFORE 'VILLAGE';
--> statement-breakpoint
ALTER TYPE "public"."role_scope" ADD VALUE IF NOT EXISTS 'GRAM_PANCHAYAT' BEFORE 'VILLAGE';
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'education_scope') THEN
    CREATE TYPE "public"."education_scope" AS ENUM('gramodaya', 'government');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'education_status') THEN
    CREATE TYPE "public"."education_status" AS ENUM('draft', 'pending', 'published', 'archived');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'education_resource_type') THEN
    CREATE TYPE "public"."education_resource_type" AS ENUM(
      'scheme', 'scholarship', 'course', 'institution', 'guidance', 'resource', 'other'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'education_link_type') THEN
    CREATE TYPE "public"."education_link_type" AS ENUM('portal', 'pdf', 'video', 'form', 'contact', 'other');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'education_enquiry_status') THEN
    CREATE TYPE "public"."education_enquiry_status" AS ENUM('new', 'in_progress', 'resolved', 'closed');
  END IF;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "education_categories" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"village_id" bigint,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"name_hindi" text,
	"name_key" text,
	"overview" text,
	"overview_hindi" text,
	"overview_key" text,
	"icon" text DEFAULT 'GraduationCap' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"status" "education_status" DEFAULT 'published' NOT NULL,
	"metadata" jsonb,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "education_resources" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"category_id" bigint NOT NULL,
	"village_id" bigint,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"title_hindi" text,
	"title_key" text,
	"description" text,
	"description_hindi" text,
	"description_key" text,
	"icon" text DEFAULT 'BookOpen' NOT NULL,
	"scope" "education_scope" DEFAULT 'government' NOT NULL,
	"type" "education_resource_type" DEFAULT 'scheme' NOT NULL,
	"status" "education_status" DEFAULT 'published' NOT NULL,
	"eligibility" text,
	"benefits" text,
	"how_to_apply" text,
	"documents_required" jsonb,
	"tags" jsonb,
	"provider" text,
	"external_url" text,
	"photo_url" text,
	"contact_name" text,
	"contact_mobile" text,
	"start_date" date,
	"end_date" date,
	"display_order" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "education_resource_links" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"resource_id" bigint NOT NULL,
	"label" text NOT NULL,
	"label_hindi" text,
	"url" text NOT NULL,
	"type" "education_link_type" DEFAULT 'portal' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "education_enquiries" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"village_id" bigint,
	"resource_id" bigint,
	"category_id" bigint,
	"user_id" uuid,
	"name" text NOT NULL,
	"mobile" text NOT NULL,
	"email" text,
	"student_class" text,
	"message" text NOT NULL,
	"status" "education_enquiry_status" DEFAULT 'new' NOT NULL,
	"assigned_to" uuid,
	"response" text,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_education_categories_village_slug" ON "education_categories" USING btree ("village_id","slug");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_education_categories_global_slug" ON "education_categories" USING btree ("slug") WHERE village_id IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_categories_village_id" ON "education_categories" USING btree ("village_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_categories_status" ON "education_categories" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_categories_display_order" ON "education_categories" USING btree ("display_order");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_education_resources_category_slug" ON "education_resources" USING btree ("category_id","slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_resources_category_id" ON "education_resources" USING btree ("category_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_resources_village_id" ON "education_resources" USING btree ("village_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_resources_status" ON "education_resources" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_resources_scope" ON "education_resources" USING btree ("scope");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_resources_type" ON "education_resources" USING btree ("type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_resources_display_order" ON "education_resources" USING btree ("display_order");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_resource_links_resource_id" ON "education_resource_links" USING btree ("resource_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_resource_links_display_order" ON "education_resource_links" USING btree ("display_order");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_enquiries_village_id" ON "education_enquiries" USING btree ("village_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_enquiries_resource_id" ON "education_enquiries" USING btree ("resource_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_enquiries_status" ON "education_enquiries" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_enquiries_mobile" ON "education_enquiries" USING btree ("mobile");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_enquiries_created_at" ON "education_enquiries" USING btree ("created_at");
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "education_categories" ADD CONSTRAINT "education_categories_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "education_categories" ADD CONSTRAINT "education_categories_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "education_resources" ADD CONSTRAINT "education_resources_category_id_education_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."education_categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "education_resources" ADD CONSTRAINT "education_resources_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "education_resources" ADD CONSTRAINT "education_resources_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "education_resource_links" ADD CONSTRAINT "education_resource_links_resource_id_education_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."education_resources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "education_enquiries" ADD CONSTRAINT "education_enquiries_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "education_enquiries" ADD CONSTRAINT "education_enquiries_resource_id_education_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."education_resources"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "education_enquiries" ADD CONSTRAINT "education_enquiries_category_id_education_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."education_categories"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "education_enquiries" ADD CONSTRAINT "education_enquiries_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "education_enquiries" ADD CONSTRAINT "education_enquiries_assigned_to_profiles_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
