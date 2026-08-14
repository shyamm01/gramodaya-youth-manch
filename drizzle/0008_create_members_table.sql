CREATE TABLE IF NOT EXISTS "members" (
	"id" text PRIMARY KEY DEFAULT ('mem_' || replace(gen_random_uuid()::text, '-', '')) NOT NULL,
	"village_id" text REFERENCES "villages"("id") ON DELETE SET NULL,
	"supabase_user_id" uuid,
	"name" text NOT NULL,
	"mobile" text NOT NULL,
	"status" "member_status" DEFAULT 'active' NOT NULL,
	"photo_url" text,
	"organization_name" text DEFAULT 'ग्रामोदय यूथ मंच',
	"father_name" text,
	"dob" text,
	"address" text DEFAULT 'ग्राम रसूलपुर, ग्राम पंचायत बहेरा',
	"role" "member_role" DEFAULT 'MEMBER' NOT NULL,
	"system_role" "system_role" DEFAULT 'MEMBER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_village_id" ON "members" USING btree ("village_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_mobile" ON "members" USING btree ("mobile");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_status" ON "members" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_system_role" ON "members" USING btree ("system_role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_members_created_at" ON "members" USING btree ("created_at");
