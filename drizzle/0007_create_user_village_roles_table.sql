-- 0007_create_user_village_roles_table.sql

CREATE TABLE IF NOT EXISTS "public"."user_village_roles" (
    "id" bigserial PRIMARY KEY NOT NULL,
    "user_id" bigint NOT NULL,
    "village_id" bigint NOT NULL REFERENCES "public"."villages"("id") ON DELETE CASCADE,
    "role" "public"."system_role" DEFAULT 'MEMBER' NOT NULL,
    "is_primary" boolean DEFAULT false NOT NULL,
    "assigned_by" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_user_village_roles_user" ON "public"."user_village_roles" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_village_roles_village" ON "public"."user_village_roles" ("village_id");
CREATE INDEX IF NOT EXISTS "idx_user_village_roles_role" ON "public"."user_village_roles" ("role");
