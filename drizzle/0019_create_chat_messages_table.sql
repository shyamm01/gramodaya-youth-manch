-- 1. Create chat_rooms table
CREATE TABLE IF NOT EXISTS "chat_rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- 2. Create chat_members table
CREATE TABLE IF NOT EXISTS "chat_members" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"member_id" text NOT NULL,
	"mobile" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'member',
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_read_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- 3. Create chat_messages table
CREATE TABLE IF NOT EXISTS "chat_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"sender_mobile" text NOT NULL,
	"sender_name" text NOT NULL,
	"sender_photo" text,
	"sender_member_id" text,
	"text" text NOT NULL,
	"photo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_read" boolean DEFAULT false,
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_chat_messages_room_id" ON "chat_messages" USING btree ("room_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_messages_created_at" ON "chat_messages" USING btree ("created_at");
--> statement-breakpoint

-- Enable Row Level Security (RLS)
ALTER TABLE "chat_rooms" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "chat_members" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "chat_messages" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

-- Public access policies for chat rooms, members, and messages
DO $$ BEGIN
  CREATE POLICY "Allow public read chat_rooms" ON "chat_rooms" FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint

DO $$ BEGIN
  CREATE POLICY "Allow public insert chat_rooms" ON "chat_rooms" FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint

DO $$ BEGIN
  CREATE POLICY "Allow public update chat_rooms" ON "chat_rooms" FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint

DO $$ BEGIN
  CREATE POLICY "Allow public read chat_members" ON "chat_members" FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint

DO $$ BEGIN
  CREATE POLICY "Allow public insert chat_members" ON "chat_members" FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint

DO $$ BEGIN
  CREATE POLICY "Allow public update chat_members" ON "chat_members" FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint

DO $$ BEGIN
  CREATE POLICY "Allow public read chat_messages" ON "chat_messages" FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint

DO $$ BEGIN
  CREATE POLICY "Allow public insert chat_messages" ON "chat_messages" FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint

DO $$ BEGIN
  CREATE POLICY "Allow public update chat_messages" ON "chat_messages" FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint

DO $$ BEGIN
  CREATE POLICY "Allow public delete chat_messages" ON "chat_messages" FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
