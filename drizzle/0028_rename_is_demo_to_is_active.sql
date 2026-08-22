-- Rename is_demo to is_active on complaints table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'complaints' AND column_name = 'is_demo'
  ) THEN
    ALTER TABLE "complaints" RENAME COLUMN "is_demo" TO "is_active";
  END IF;
END $$;

--> statement-breakpoint
-- Ensure is_active column exists and has proper default & not null
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'complaints' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE "complaints" ADD COLUMN "is_active" boolean NOT NULL DEFAULT true;
  ELSE
    ALTER TABLE "complaints" ALTER COLUMN "is_active" SET DEFAULT true;
    UPDATE "complaints" SET "is_active" = true WHERE "is_active" IS NULL;
  END IF;
END $$;

--> statement-breakpoint
-- Add index on is_active for faster querying of active grievances
CREATE INDEX IF NOT EXISTS "idx_complaints_is_active" ON "complaints" ("is_active");
