-- 0018_create_audit_logs_table.sql

CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" bigserial PRIMARY KEY NOT NULL,
    "village_id" bigint REFERENCES "public"."villages"("id") ON DELETE SET NULL,
    "user_id" text,
    "user_name" text NOT NULL,
    "action" text NOT NULL,
    "details" text,
    "ip_address" text,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_audit_logs_village_id" ON "public"."audit_logs" ("village_id");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_timestamp" ON "public"."audit_logs" ("timestamp");
