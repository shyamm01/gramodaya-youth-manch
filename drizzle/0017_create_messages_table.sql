CREATE TABLE IF NOT EXISTS "messages" (
	"id" text PRIMARY KEY DEFAULT ('msg_' || replace(gen_random_uuid()::text, '-', '')) NOT NULL,
	"sender_mobile" text NOT NULL,
	"sender_name" text NOT NULL,
	"recipient_mobile" text NOT NULL,
	"recipient_name" text NOT NULL,
	"text" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_messages_pair" ON "messages" USING btree ("sender_mobile", "recipient_mobile");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_messages_created_at" ON "messages" USING btree ("created_at");
