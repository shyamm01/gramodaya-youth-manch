CREATE TABLE IF NOT EXISTS "public_infos" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"village_id" bigint,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"submitter_name" text NOT NULL,
	"submitter_mobile" text NOT NULL,
	"status" "public_info_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_public_infos_village_id" ON "public_infos" USING btree ("village_id");
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "public_infos" ADD CONSTRAINT "public_infos_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint