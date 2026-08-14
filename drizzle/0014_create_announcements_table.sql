-- 0014_create_announcements_table.sql

CREATE TABLE IF NOT EXISTS "public"."announcements" (
    "id" bigserial PRIMARY KEY NOT NULL,
    "village_id" bigint REFERENCES "public"."villages"("id") ON DELETE SET NULL,
    "title" text NOT NULL,
    "content" text NOT NULL,
    "published_by" text DEFAULT 'ग्रामोदय यूथ मंच' NOT NULL,
    "is_urgent" boolean DEFAULT false,
    "date" date DEFAULT CURRENT_DATE NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_announcements_village_id" ON "public"."announcements" ("village_id");
