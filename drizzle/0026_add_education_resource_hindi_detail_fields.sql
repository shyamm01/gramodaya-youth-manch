-- Migration: 0026_add_education_resource_hindi_detail_fields.sql
-- Hindi twins for the long-form resource fields.
--
-- The module already pairs every short text column (title/title_hindi,
-- description/description_hindi); the detail fields were English-only, which is
-- the wrong language for most readers of a site that defaults to Hindi. Null
-- falls back to the English column, so existing rows need no backfill.
ALTER TABLE "education_resources" ADD COLUMN IF NOT EXISTS "eligibility_hindi" text;--> statement-breakpoint
ALTER TABLE "education_resources" ADD COLUMN IF NOT EXISTS "benefits_hindi" text;--> statement-breakpoint
ALTER TABLE "education_resources" ADD COLUMN IF NOT EXISTS "how_to_apply_hindi" text;--> statement-breakpoint
ALTER TABLE "education_resources" ADD COLUMN IF NOT EXISTS "documents_required_hindi" jsonb;--> statement-breakpoint
ALTER TABLE "education_resources" ADD COLUMN IF NOT EXISTS "provider_hindi" text;
