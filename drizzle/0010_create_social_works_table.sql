CREATE TABLE IF NOT EXISTS "social_works" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"village_id" bigint,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"date" date DEFAULT CURRENT_DATE NOT NULL,
	"location" text DEFAULT 'Rasoolpur' NOT NULL,
	"submitter_name" text NOT NULL,
	"submitter_mobile" text NOT NULL,
	"photo_url" text,
	"video_url" text,
	"status" "social_work_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_social_works_village_id" ON "social_works" USING btree ("village_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_social_works_status" ON "social_works" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_social_works_created_at" ON "social_works" USING btree ("created_at");
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "social_works" ADD CONSTRAINT "social_works_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint