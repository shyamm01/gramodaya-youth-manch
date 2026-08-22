-- Migration: 0027_normalize_complaints.sql
-- Normalize the complaints system: categories lookup, attachments, status history, priority

-- 1. Complaint Priority Enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'complaint_priority') THEN
    CREATE TYPE "public"."complaint_priority" AS ENUM('low', 'medium', 'high', 'urgent');
  END IF;
END $$;
--> statement-breakpoint

-- 2. Complaint Attachment Type Enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'complaint_attachment_type') THEN
    CREATE TYPE "public"."complaint_attachment_type" AS ENUM('photo', 'video', 'document');
  END IF;
END $$;
--> statement-breakpoint

-- 3. Complaint Categories Lookup Table
CREATE TABLE IF NOT EXISTS "complaint_categories" (
  "id" bigserial PRIMARY KEY NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "name_hindi" text NOT NULL,
  "icon" text DEFAULT '📌' NOT NULL,
  "display_order" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_complaint_categories_slug" ON "complaint_categories" USING btree ("slug");
--> statement-breakpoint

-- 4. Seed complaint categories from existing enum values
INSERT INTO "complaint_categories" ("slug", "name", "name_hindi", "icon", "display_order") VALUES
  ('water', 'Water', 'पानी', '🚰', 1),
  ('road', 'Road', 'सड़क', '🛣️', 2),
  ('electricity', 'Electricity', 'बिजली', '💡', 3),
  ('cleanliness', 'Cleanliness', 'स्वच्छता', '🧹', 4),
  ('environment', 'Environment', 'पर्यावरण', '🌳', 5),
  ('education', 'Education', 'शिक्षा', '🏫', 6),
  ('health', 'Health', 'स्वास्थ्य', '🏥', 7),
  ('sanitation', 'Sanitation', 'शौचालय', '🚽', 8),
  ('animal-related', 'Animal-related', 'पशु संबंधी मुद्दा', '🐄', 9),
  ('social-issue', 'Social Issue', 'सामाजिक मुद्दा', '👥', 10),
  ('government-service', 'Government Service', 'सरकारी सेवा', '🏛️', 11),
  ('other', 'Other', 'अन्य', '📌', 12)
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint

-- 5. Add new columns to complaints table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='complaints' AND column_name='category_id') THEN
    ALTER TABLE "complaints" ADD COLUMN "category_id" bigint;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='complaints' AND column_name='priority') THEN
    ALTER TABLE "complaints" ADD COLUMN "priority" "complaint_priority" DEFAULT 'medium' NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='complaints' AND column_name='ward') THEN
    ALTER TABLE "complaints" ADD COLUMN "ward" text;
  END IF;
END $$;
--> statement-breakpoint

-- 6. Backfill category_id from existing category enum column
UPDATE "complaints" c
SET "category_id" = cc."id"
FROM "complaint_categories" cc
WHERE LOWER(c."category"::text) = LOWER(cc."name")
  AND c."category_id" IS NULL;
--> statement-breakpoint

-- 7. Add FK constraint for category_id
DO $$ BEGIN
  ALTER TABLE "complaints" ADD CONSTRAINT "complaints_category_id_complaint_categories_id_fk"
    FOREIGN KEY ("category_id") REFERENCES "public"."complaint_categories"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_complaints_category_id" ON "complaints" USING btree ("category_id");
--> statement-breakpoint

-- 8. Complaint Attachments Table
CREATE TABLE IF NOT EXISTS "complaint_attachments" (
  "id" bigserial PRIMARY KEY NOT NULL,
  "complaint_id" bigint NOT NULL,
  "type" "complaint_attachment_type" DEFAULT 'photo' NOT NULL,
  "url" text NOT NULL,
  "caption" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "complaint_attachments" ADD CONSTRAINT "complaint_attachments_complaint_id_complaints_id_fk"
    FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_complaint_attachments_complaint_id" ON "complaint_attachments" USING btree ("complaint_id");
--> statement-breakpoint

-- 9. Migrate existing photo_url / video_url into complaint_attachments
INSERT INTO "complaint_attachments" ("complaint_id", "type", "url")
SELECT "id", 'photo'::"complaint_attachment_type", "photo_url"
FROM "complaints"
WHERE "photo_url" IS NOT NULL AND "photo_url" != ''
ON CONFLICT DO NOTHING;
--> statement-breakpoint

INSERT INTO "complaint_attachments" ("complaint_id", "type", "url")
SELECT "id", 'video'::"complaint_attachment_type", "video_url"
FROM "complaints"
WHERE "video_url" IS NOT NULL AND "video_url" != ''
ON CONFLICT DO NOTHING;
--> statement-breakpoint

-- 10. Complaint Status History Table (audit trail)
CREATE TABLE IF NOT EXISTS "complaint_status_history" (
  "id" bigserial PRIMARY KEY NOT NULL,
  "complaint_id" bigint NOT NULL,
  "from_status" text,
  "to_status" text NOT NULL,
  "changed_by" uuid,
  "note" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "complaint_status_history" ADD CONSTRAINT "complaint_status_history_complaint_id_fk"
    FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "complaint_status_history" ADD CONSTRAINT "complaint_status_history_changed_by_fk"
    FOREIGN KEY ("changed_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_complaint_status_history_complaint_id" ON "complaint_status_history" USING btree ("complaint_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_complaint_status_history_created_at" ON "complaint_status_history" USING btree ("created_at");
--> statement-breakpoint

-- 11. Seed initial status history from existing complaints
INSERT INTO "complaint_status_history" ("complaint_id", "from_status", "to_status", "created_at")
SELECT "id", NULL, "status"::text, "created_at"
FROM "complaints"
ON CONFLICT DO NOTHING;
--> statement-breakpoint

-- 12. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_complaints_updated_at'
  ) THEN
    CREATE TRIGGER trg_complaints_updated_at
      BEFORE UPDATE ON complaints
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
--> statement-breakpoint

-- 13. Add composite index for common query pattern (village + status)
CREATE INDEX IF NOT EXISTS "idx_complaints_village_status" ON "complaints" USING btree ("village_id", "status");
--> statement-breakpoint

-- 14. Add priority index
CREATE INDEX IF NOT EXISTS "idx_complaints_priority" ON "complaints" USING btree ("priority");
--> statement-breakpoint
