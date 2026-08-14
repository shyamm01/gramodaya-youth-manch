CREATE TYPE "public"."role_scope" AS ENUM('GLOBAL', 'VILLAGE');--> statement-breakpoint
CREATE TYPE "public"."system_role" AS ENUM('SUPER_ADMIN', 'ADMIN', 'MEMBER');--> statement-breakpoint
ALTER TYPE "public"."member_status" ADD VALUE 'suspended';--> statement-breakpoint
CREATE TABLE "districts" (
	"id" text PRIMARY KEY NOT NULL,
	"state_id" text NOT NULL,
	"name" text NOT NULL,
	"name_hindi" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gram_panchayats" (
	"id" text PRIMARY KEY NOT NULL,
	"district_id" text NOT NULL,
	"name" text NOT NULL,
	"name_hindi" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"module" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "states" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_hindi" text NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "states_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "user_permissions" (
	"id" text PRIMARY KEY DEFAULT ('uperm_' || replace(gen_random_uuid()::text, '-', '')) NOT NULL,
	"user_id" text NOT NULL,
	"permission_code" text NOT NULL,
	"scope_type" "role_scope" DEFAULT 'VILLAGE' NOT NULL,
	"scope_id" text,
	"is_granted" boolean DEFAULT true NOT NULL,
	"granted_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_village_roles" (
	"id" text PRIMARY KEY DEFAULT ('uvr_' || replace(gen_random_uuid()::text, '-', '')) NOT NULL,
	"user_id" text NOT NULL,
	"village_id" text NOT NULL,
	"role" "system_role" DEFAULT 'MEMBER' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "villages" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"name_hindi" text NOT NULL,
	"gram_panchayat_id" text,
	"district_id" text,
	"state_id" text,
	"org_name" text DEFAULT 'Gramodaya Youth Manch' NOT NULL,
	"org_name_hindi" text DEFAULT 'ग्रामोदय यूथ मंच' NOT NULL,
	"slogan_hindi" text DEFAULT 'युवा शक्ति • ग्राम विकास • उज्ज्वल भविष्य',
	"tagline_hindi" text DEFAULT 'युवा शक्ति से ग्रामोदय की ओर',
	"org_purpose_hindi" text,
	"contact_mobile" text,
	"contact_email" text,
	"banner_photo_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "villages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DROP INDEX "idx_members_role";--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "admin_mobile" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "record_affected" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "village_id" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "village_id" text;--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN "village_id" text;--> statement-breakpoint
ALTER TABLE "elders" ADD COLUMN "village_id" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "village_id" text;--> statement-breakpoint
ALTER TABLE "gallery" ADD COLUMN "village_id" text;--> statement-breakpoint
ALTER TABLE "group_messages" ADD COLUMN "village_id" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "village_id" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "system_role" "system_role" DEFAULT 'MEMBER' NOT NULL;--> statement-breakpoint
ALTER TABLE "public_infos" ADD COLUMN "village_id" text;--> statement-breakpoint
ALTER TABLE "social_works" ADD COLUMN "village_id" text;--> statement-breakpoint
ALTER TABLE "districts" ADD CONSTRAINT "districts_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gram_panchayats" ADD CONSTRAINT "gram_panchayats_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_code_permissions_code_fk" FOREIGN KEY ("permission_code") REFERENCES "public"."permissions"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_village_roles" ADD CONSTRAINT "user_village_roles_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "villages" ADD CONSTRAINT "villages_gram_panchayat_id_gram_panchayats_id_fk" FOREIGN KEY ("gram_panchayat_id") REFERENCES "public"."gram_panchayats"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "villages" ADD CONSTRAINT "villages_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "villages" ADD CONSTRAINT "villages_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_districts_state_id" ON "districts" USING btree ("state_id");--> statement-breakpoint
CREATE INDEX "idx_districts_name" ON "districts" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_gram_panchayats_district_id" ON "gram_panchayats" USING btree ("district_id");--> statement-breakpoint
CREATE INDEX "idx_gram_panchayats_name" ON "gram_panchayats" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_states_code" ON "states" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_user_permissions_user_id" ON "user_permissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_permissions_perm_code" ON "user_permissions" USING btree ("permission_code");--> statement-breakpoint
CREATE INDEX "idx_user_permissions_scope" ON "user_permissions" USING btree ("scope_type","scope_id");--> statement-breakpoint
CREATE INDEX "idx_user_village_roles_user" ON "user_village_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_village_roles_village" ON "user_village_roles" USING btree ("village_id");--> statement-breakpoint
CREATE INDEX "idx_user_village_roles_role" ON "user_village_roles" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_villages_slug" ON "villages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_villages_panchayat_id" ON "villages" USING btree ("gram_panchayat_id");--> statement-breakpoint
CREATE INDEX "idx_villages_district_id" ON "villages" USING btree ("district_id");--> statement-breakpoint
CREATE INDEX "idx_villages_is_active" ON "villages" USING btree ("is_active");--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "elders" ADD CONSTRAINT "elders_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_messages" ADD CONSTRAINT "group_messages_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_infos" ADD CONSTRAINT "public_infos_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_works" ADD CONSTRAINT "social_works_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_announcements_village_id" ON "announcements" USING btree ("village_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_village_id" ON "audit_logs" USING btree ("village_id");--> statement-breakpoint
CREATE INDEX "idx_complaints_village_id" ON "complaints" USING btree ("village_id");--> statement-breakpoint
CREATE INDEX "idx_elders_village_id" ON "elders" USING btree ("village_id");--> statement-breakpoint
CREATE INDEX "idx_events_village_id" ON "events" USING btree ("village_id");--> statement-breakpoint
CREATE INDEX "idx_gallery_village_id" ON "gallery" USING btree ("village_id");--> statement-breakpoint
CREATE INDEX "idx_group_messages_village_id" ON "group_messages" USING btree ("village_id");--> statement-breakpoint
CREATE INDEX "idx_members_village_id" ON "members" USING btree ("village_id");--> statement-breakpoint
CREATE INDEX "idx_members_system_role" ON "members" USING btree ("system_role");--> statement-breakpoint
CREATE INDEX "idx_public_infos_village_id" ON "public_infos" USING btree ("village_id");--> statement-breakpoint
CREATE INDEX "idx_social_works_village_id" ON "social_works" USING btree ("village_id");