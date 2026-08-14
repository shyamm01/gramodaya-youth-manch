-- 0015_create_public_infos_table.sql

CREATE TABLE IF NOT EXISTS "public"."public_infos" (
    "id" bigserial PRIMARY KEY NOT NULL,
    "village_id" bigint REFERENCES "public"."villages"("id") ON DELETE SET NULL,
    "title" text NOT NULL,
    "description" text NOT NULL,
    "category" text NOT NULL,
    "submitter_name" text NOT NULL,
    "submitter_mobile" text NOT NULL,
    "status" "public"."public_info_status" DEFAULT 'pending' NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_public_infos_village_id" ON "public"."public_infos" ("village_id");
