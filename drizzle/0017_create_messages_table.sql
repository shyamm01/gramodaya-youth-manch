-- 0017_create_messages_table.sql

CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" bigserial PRIMARY KEY NOT NULL,
    "village_id" bigint REFERENCES "public"."villages"("id") ON DELETE SET NULL,
    "room_id" text DEFAULT 'general',
    "sender_id" text NOT NULL,
    "sender_name" text NOT NULL,
    "sender_role" text DEFAULT 'Member',
    "sender_mobile" text,
    "sender_photo" text,
    "text" text NOT NULL,
    "photo_url" text,
    "timestamp" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_messages_created_at" ON "public"."messages" ("created_at");
