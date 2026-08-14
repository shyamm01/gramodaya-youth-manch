-- 0001_create_states_table.sql

CREATE TABLE IF NOT EXISTS "public"."states" (
    "id" bigserial PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "name_hindi" text NOT NULL,
    "code" text NOT NULL UNIQUE,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_states_code" ON "public"."states" ("code");
