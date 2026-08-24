-- ============================================================================
-- 0010 · complaint_categories (शिकायत श्रेणियां)
-- ----------------------------------------------------------------------------
-- Lookup table for grievance categories. Replaces the `complaint_category`
-- enum, which forced a schema migration for every new category and had no room
-- for the Hindi label, icon or ordering the UI needs — so those lived in a
-- hard-coded map in the frontend, a second source of truth.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "complaint_categories" (
  "id"             bigserial PRIMARY KEY NOT NULL,
  "slug"           text NOT NULL,
  "name"           text NOT NULL,
  "name_hindi"     text NOT NULL,
  "icon"           text DEFAULT '📌' NOT NULL,
  "display_order"  integer DEFAULT 0 NOT NULL,
  "is_active"      boolean DEFAULT true NOT NULL,
  "created_at"     timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
ALTER TABLE "complaint_categories" DROP CONSTRAINT IF EXISTS "complaint_categories_slug_key";
--> statement-breakpoint
ALTER TABLE "complaint_categories" DROP CONSTRAINT IF EXISTS "complaint_categories_slug_unique";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_complaint_categories_slug";
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_complaint_categories_slug"
  ON "complaint_categories" USING btree ("slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_complaint_categories_display_order"
  ON "complaint_categories" USING btree ("display_order");
--> statement-breakpoint

-- Seed the canonical twelve. These carry the same names the retired
-- `complaint_category` enum used, so 0011 can map existing rows by name.
INSERT INTO "complaint_categories" ("slug", "name", "name_hindi", "icon", "display_order") VALUES
  ('water',              'Water',              'पानी',                '🚰', 1),
  ('road',               'Road',               'सड़क',                '🛣️', 2),
  ('electricity',        'Electricity',        'बिजली',               '💡', 3),
  ('cleanliness',        'Cleanliness',        'स्वच्छता',             '🧹', 4),
  ('environment',        'Environment',        'पर्यावरण',            '🌳', 5),
  ('education',          'Education',          'शिक्षा',               '🏫', 6),
  ('health',             'Health',             'स्वास्थ्य',            '🏥', 7),
  ('sanitation',         'Sanitation',         'शौचालय',              '🚽', 8),
  ('animal-related',     'Animal-related',     'पशु संबंधी मुद्दा',      '🐄', 9),
  ('social-issue',       'Social Issue',       'सामाजिक मुद्दा',        '👥', 10),
  ('government-service', 'Government Service', 'सरकारी सेवा',          '🏛️', 11),
  ('other',              'Other',              'अन्य',                 '📌', 12)
ON CONFLICT ("slug") DO NOTHING;
