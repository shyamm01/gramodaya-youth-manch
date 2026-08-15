CREATE TABLE IF NOT EXISTS "group_messages" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"village_id" bigint,
	"sender_name" text NOT NULL,
	"sender_role" text DEFAULT 'Member',
	"sender_mobile" text,
	"sender_photo" text,
	"text" text NOT NULL,
	"timestamp" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_group_messages_village_id" ON "group_messages" USING btree ("village_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_group_messages_created_at" ON "group_messages" USING btree ("created_at");
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "group_messages" ADD CONSTRAINT "group_messages_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint