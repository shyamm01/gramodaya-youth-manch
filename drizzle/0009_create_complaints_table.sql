-- 0009_create_complaints_table.sql

CREATE TABLE IF NOT EXISTS "public"."complaints" (
    "id" bigserial PRIMARY KEY NOT NULL,
    "village_id" bigint REFERENCES "public"."villages"("id") ON DELETE SET NULL,
    "user_id" uuid,
    "title" text NOT NULL,
    "category" "public"."complaint_category" DEFAULT 'Other' NOT NULL,
    "description" text NOT NULL,
    "location" text DEFAULT 'Rasoolpur' NOT NULL,
    "reporter_name" text NOT NULL,
    "reporter_mobile" text NOT NULL,
    "status" "public"."complaint_status" DEFAULT 'NEW' NOT NULL,
    "photo_url" text,
    "video_url" text,
    "is_demo" boolean DEFAULT false,
    "resolved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_complaints_village_id" ON "public"."complaints" ("village_id");
CREATE INDEX IF NOT EXISTS "idx_complaints_status" ON "public"."complaints" ("status");
CREATE INDEX IF NOT EXISTS "idx_complaints_category" ON "public"."complaints" ("category");
CREATE INDEX IF NOT EXISTS "idx_complaints_created_at" ON "public"."complaints" ("created_at");
