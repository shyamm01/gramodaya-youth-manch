-- 0003_create_gram_panchayats_table.sql

CREATE TABLE IF NOT EXISTS "public"."gram_panchayats" (
    "id" bigserial PRIMARY KEY NOT NULL,
    "district_id" bigint NOT NULL REFERENCES "public"."districts"("id") ON DELETE RESTRICT,
    "name" text NOT NULL,
    "name_hindi" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_gram_panchayats_district_id" ON "public"."gram_panchayats" ("district_id");
CREATE INDEX IF NOT EXISTS "idx_gram_panchayats_name" ON "public"."gram_panchayats" ("name");
