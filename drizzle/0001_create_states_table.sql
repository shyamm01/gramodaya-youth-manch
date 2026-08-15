CREATE TABLE IF NOT EXISTS "states" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_hindi" text NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "states_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_states_code" ON "states" USING btree ("code");
--> statement-breakpoint