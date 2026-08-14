-- 0008_create_members_table.sql
-- Members Directory with RBAC role, gender, and full background profile fields

CREATE TABLE IF NOT EXISTS "public"."members" (
    "id" bigserial PRIMARY KEY NOT NULL,
    "village_id" bigint REFERENCES "public"."villages"("id") ON DELETE SET NULL,
    "supabase_user_id" uuid,
    "name" text NOT NULL,
    "mobile" text NOT NULL UNIQUE,
    "status" "public"."member_status" DEFAULT 'active' NOT NULL,
    "photo_url" text,
    "organization_name" text DEFAULT 'ग्रामोदय यूथ मंच',
    "father_name" text,
    "dob" text,
    "gender" text,
    "address" text DEFAULT 'ग्राम रसूलपुर, ग्राम पंचायत बहेरा',
    "occupation" text,
    "designation" text,
    "political_background" text,
    "blood_group" text,
    "role" "public"."member_role" DEFAULT 'MEMBER' NOT NULL,
    "system_role" "public"."system_role" DEFAULT 'MEMBER' NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_members_village_id" ON "public"."members" ("village_id");
CREATE INDEX IF NOT EXISTS "idx_members_mobile" ON "public"."members" ("mobile");
CREATE INDEX IF NOT EXISTS "idx_members_status" ON "public"."members" ("status");
CREATE INDEX IF NOT EXISTS "idx_members_system_role" ON "public"."members" ("system_role");
CREATE INDEX IF NOT EXISTS "idx_members_created_at" ON "public"."members" ("created_at");
