CREATE TABLE IF NOT EXISTS "permissions" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"module" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
