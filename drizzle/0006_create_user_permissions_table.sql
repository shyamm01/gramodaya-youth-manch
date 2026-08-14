-- 0006_create_user_permissions_table.sql

CREATE TABLE IF NOT EXISTS "public"."user_permissions" (
    "id" bigserial PRIMARY KEY NOT NULL,
    "user_id" bigint NOT NULL,
    "permission_code" text NOT NULL REFERENCES "public"."permissions"("code") ON DELETE CASCADE,
    "scope_type" "public"."role_scope" DEFAULT 'VILLAGE' NOT NULL,
    "scope_id" bigint,
    "is_granted" boolean DEFAULT true NOT NULL,
    "granted_by" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_user_permissions_user_id" ON "public"."user_permissions" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_permissions_perm_code" ON "public"."user_permissions" ("permission_code");
CREATE INDEX IF NOT EXISTS "idx_user_permissions_scope" ON "public"."user_permissions" ("scope_type", "scope_id");
