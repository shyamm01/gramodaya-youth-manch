-- 0013_create_elders_table.sql

CREATE TABLE IF NOT EXISTS "public"."elders" (
    "id" bigserial PRIMARY KEY NOT NULL,
    "village_id" bigint REFERENCES "public"."villages"("id") ON DELETE SET NULL,
    "name" text NOT NULL,
    "age" text,
    "role" text,
    "contribution" text,
    "photo_url" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_elders_village_id" ON "public"."elders" ("village_id");
