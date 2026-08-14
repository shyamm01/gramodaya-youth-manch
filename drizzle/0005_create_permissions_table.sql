-- 0005_create_permissions_table.sql

CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" bigserial PRIMARY KEY NOT NULL,
    "code" text NOT NULL UNIQUE,
    "name" text NOT NULL,
    "module" text NOT NULL,
    "description" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
