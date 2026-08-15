CREATE TABLE IF NOT EXISTS "elders" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"village_id" bigint,
	"name" text NOT NULL,
	"age" text,
	"role" text,
	"contribution" text,
	"photo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_elders_village_id" ON "elders" USING btree ("village_id");
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "elders" ADD CONSTRAINT "elders_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint