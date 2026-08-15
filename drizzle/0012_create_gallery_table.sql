CREATE TABLE IF NOT EXISTS "gallery" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"village_id" bigint,
	"caption" text,
	"photo_url" text NOT NULL,
	"uploaded_by" text DEFAULT 'Admin' NOT NULL,
	"uploaded_by_mobile" text,
	"date" date DEFAULT CURRENT_DATE NOT NULL,
	"status" "gallery_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gallery_village_id" ON "gallery" USING btree ("village_id");
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "gallery" ADD CONSTRAINT "gallery_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint