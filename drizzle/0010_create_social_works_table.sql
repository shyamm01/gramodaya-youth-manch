-- 0010_create_social_works_table.sql

CREATE TABLE IF NOT EXISTS "public"."social_works" (
    "id" bigserial PRIMARY KEY NOT NULL,
    "village_id" bigint REFERENCES "public"."villages"("id") ON DELETE SET NULL,
    "title" text NOT NULL,
    "description" text NOT NULL,
    "date" date DEFAULT CURRENT_DATE NOT NULL,
    "location" text DEFAULT 'Rasoolpur' NOT NULL,
    "submitter_name" text NOT NULL,
    "submitter_mobile" text NOT NULL,
    "photo_url" text,
    "video_url" text,
    "status" "public"."social_work_status" DEFAULT 'pending' NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_social_works_village_id" ON "public"."social_works" ("village_id");
CREATE INDEX IF NOT EXISTS "idx_social_works_status" ON "public"."social_works" ("status");
CREATE INDEX IF NOT EXISTS "idx_social_works_date" ON "public"."social_works" ("date");
