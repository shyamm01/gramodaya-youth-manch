CREATE TABLE IF NOT EXISTS "announcements" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"village_id" bigint,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"published_by" text DEFAULT 'ग्रामोदय यूथ मंच' NOT NULL,
	"is_urgent" boolean DEFAULT false,
	"date" date DEFAULT CURRENT_DATE NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_announcements_village_id" ON "announcements" USING btree ("village_id");
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "announcements" ADD CONSTRAINT "announcements_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint