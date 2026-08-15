CREATE TABLE IF NOT EXISTS "messages" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"village_id" bigint,
	"room_id" text DEFAULT 'general',
	"sender_id" text NOT NULL,
	"sender_name" text NOT NULL,
	"sender_role" text DEFAULT 'Member',
	"sender_mobile" text,
	"sender_photo" text,
	"text" text NOT NULL,
	"photo_url" text,
	"timestamp" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_messages_created_at" ON "messages" USING btree ("created_at");
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "messages" ADD CONSTRAINT "messages_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint