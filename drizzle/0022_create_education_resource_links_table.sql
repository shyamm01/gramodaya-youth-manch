-- ============================================================================
-- 0022 · education_resource_links
-- ----------------------------------------------------------------------------
-- Apply-here portals, PDFs, videos and forms attached to a resource. A separate
-- relation rather than a jsonb array on education_resources so links can be
-- ordered, typed and queried across resources.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "education_resource_links" (
  "id"             bigserial PRIMARY KEY NOT NULL,
  "resource_id"    bigint NOT NULL,
  "label"          text NOT NULL,
  "label_hindi"    text,
  "url"            text NOT NULL,
  "type"           "education_link_type" DEFAULT 'portal' NOT NULL,
  "display_order"  integer DEFAULT 0 NOT NULL,
  "created_at"     timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Foreign keys ---------------------------------------------------------------
SELECT gym_drop_foreign_keys('education_resource_links', 'resource_id');
--> statement-breakpoint
DELETE FROM "education_resource_links" l
 WHERE NOT EXISTS (SELECT 1 FROM "education_resources" r WHERE r."id" = l."resource_id");
--> statement-breakpoint
ALTER TABLE "education_resource_links"
  ADD CONSTRAINT "education_resource_links_resource_id_education_resources_id_fk"
  FOREIGN KEY ("resource_id") REFERENCES "public"."education_resources"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "idx_education_resource_links_resource_id"
  ON "education_resource_links" USING btree ("resource_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_education_resource_links_display_order"
  ON "education_resource_links" USING btree ("display_order");
