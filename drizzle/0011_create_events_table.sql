-- 0011_create_events_table.sql

CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" bigserial PRIMARY KEY NOT NULL,
    "village_id" bigint REFERENCES "public"."villages"("id") ON DELETE SET NULL,
    "title" text NOT NULL,
    "description" text,
    "date" text NOT NULL,
    "time" text DEFAULT '10:00 AM' NOT NULL,
    "location" text DEFAULT 'Rasoolpur Village' NOT NULL,
    "photo_url" text,
    "video_url" text,
    "status" "public"."event_status" DEFAULT 'PUBLISHED' NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_events_village_id" ON "public"."events" ("village_id");
CREATE INDEX IF NOT EXISTS "idx_events_status" ON "public"."events" ("status");
