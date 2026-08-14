CREATE TABLE IF NOT EXISTS "states" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_hindi" text NOT NULL,
	"code" text NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_states_code" ON "states" USING btree ("code");
