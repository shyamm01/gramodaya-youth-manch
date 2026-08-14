-- 0012_create_gallery_table.sql

CREATE TABLE IF NOT EXISTS "public"."gallery" (
    "id" bigserial PRIMARY KEY NOT NULL,
    "village_id" bigint REFERENCES "public"."villages"("id") ON DELETE SET NULL,
    "caption" text,
    "photo_url" text NOT NULL,
    "uploaded_by" text DEFAULT 'Admin' NOT NULL,
    "uploaded_by_mobile" text,
    "date" date DEFAULT CURRENT_DATE NOT NULL,
    "status" "public"."gallery_status" DEFAULT 'published' NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_gallery_village_id" ON "public"."gallery" ("village_id");
