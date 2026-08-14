-- 0002_create_districts_table.sql

CREATE TABLE IF NOT EXISTS "public"."districts" (
    "id" bigserial PRIMARY KEY NOT NULL,
    "state_id" bigint NOT NULL REFERENCES "public"."states"("id") ON DELETE RESTRICT,
    "name" text NOT NULL,
    "name_hindi" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_districts_state_id" ON "public"."districts" ("state_id");
CREATE INDEX IF NOT EXISTS "idx_districts_name" ON "public"."districts" ("name");
