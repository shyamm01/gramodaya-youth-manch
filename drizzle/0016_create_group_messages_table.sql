CREATE TABLE IF NOT EXISTS "group_messages" (
	"id" text PRIMARY KEY DEFAULT ('gmsg_' || replace(gen_random_uuid()::text, '-', '')) NOT NULL,
	"village_id" text REFERENCES "villages"("id") ON DELETE SET NULL,
	"sender_name" text NOT NULL,
	"sender_mobile" text,
	"sender_photo" text,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_group_messages_village_id" ON "group_messages" USING btree ("village_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_group_messages_created_at" ON "group_messages" USING btree ("created_at");
