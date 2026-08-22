-- Migration: 0025_add_education_resource_cta_label.sql
-- Per-resource label for the action button on a scheme card.
--
-- Null keeps the UI's own translated default ("Learn more" / "अधिक जानें"), so
-- existing rows need no backfill and still read correctly in both languages.
-- IF NOT EXISTS so re-running against a database that already has the columns
-- is a no-op, matching the other migrations in this folder.
ALTER TABLE "education_resources" ADD COLUMN IF NOT EXISTS "cta_label" text;--> statement-breakpoint
ALTER TABLE "education_resources" ADD COLUMN IF NOT EXISTS "cta_label_hindi" text;
