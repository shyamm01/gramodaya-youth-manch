-- 0016_create_group_messages_table.sql

CREATE TABLE IF NOT EXISTS "public"."group_messages" (
    "id" bigserial PRIMARY KEY NOT NULL,
    "village_id" bigint REFERENCES "public"."villages"("id") ON DELETE SET NULL,
    "sender_name" text NOT NULL,
    "sender_role" text DEFAULT 'Member',
    "sender_mobile" text,
    "sender_photo" text,
    "text" text NOT NULL,
    "timestamp" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_group_messages_village_id" ON "public"."group_messages" ("village_id");
CREATE INDEX IF NOT EXISTS "idx_group_messages_created_at" ON "public"."group_messages" ("created_at");
