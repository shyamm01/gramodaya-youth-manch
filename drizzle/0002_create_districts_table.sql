CREATE TABLE IF NOT EXISTS "districts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"state_id" bigint NOT NULL,
	"name" text NOT NULL,
	"name_hindi" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_districts_state_id" ON "districts" USING btree ("state_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_districts_name" ON "districts" USING btree ("name");
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "districts" ADD CONSTRAINT "districts_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint