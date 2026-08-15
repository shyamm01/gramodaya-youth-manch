CREATE TABLE IF NOT EXISTS "members" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"village_id" bigint NOT NULL,
	"supabase_user_id" uuid,
	"name" text NOT NULL,
	"mobile" text NOT NULL,
	"email" text,
	"password_hash" text,
	"status" "member_status" DEFAULT 'active' NOT NULL,
	"photo_url" text,
	"father_name" text,
	"dob" text,
	"gender" text,
	"address" text,
	"house_no" text,
	"street" text,
	"pincode" text,
	"occupation" text,
	"designation" text,
	"political_background" text,
	"blood_group" text,
	"role" "member_role" DEFAULT 'MEMBER' NOT NULL,
	"system_role" "system_role" DEFAULT 'MEMBER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "members_mobile_unique" UNIQUE("mobile")
);
--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN IF EXISTS "state";
ALTER TABLE "members" DROP COLUMN IF EXISTS "district";
ALTER TABLE "members" DROP COLUMN IF EXISTS "block";
ALTER TABLE "members" DROP COLUMN IF EXISTS "gram_panchayat";
ALTER TABLE "members" DROP COLUMN IF EXISTS "village_name";
ALTER TABLE "members" DROP COLUMN IF EXISTS "post_office";
ALTER TABLE "members" DROP COLUMN IF EXISTS "organization_name";
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_village_id" ON "members" USING btree ("village_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_members_mobile" ON "members" USING btree ("mobile");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_status" ON "members" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_system_role" ON "members" USING btree ("system_role");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_created_at" ON "members" USING btree ("created_at");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "members" ADD CONSTRAINT "members_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;