-- Add explicit Hindi columns to complaints table
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "title_hindi" text;
--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "description_hindi" text;
--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "location_hindi" text;
--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "ward_hindi" text;
--> statement-breakpoint
-- Backfill initial Hindi columns with existing content where null
UPDATE "complaints" 
SET 
  "title_hindi" = COALESCE("title_hindi", "title"),
  "description_hindi" = COALESCE("description_hindi", "description"),
  "location_hindi" = COALESCE("location_hindi", "location"),
  "ward_hindi" = COALESCE("ward_hindi", "ward")
WHERE "title_hindi" IS NULL OR "description_hindi" IS NULL;
