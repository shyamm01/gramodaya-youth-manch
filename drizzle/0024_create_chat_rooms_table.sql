-- ============================================================================
-- 0024 · chat_rooms
-- ----------------------------------------------------------------------------
-- A conversation: the village-wide manch, a topic group, or a direct thread.
-- The primary key is a text slug ('general', 'direct_<a>_<b>') because room ids
-- are addressed by name from the realtime client, not allocated by the DB.
--
-- Fixed here: `type` was untyped text, so any string was a legal room type.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "chat_rooms" (
  "id"          text PRIMARY KEY NOT NULL,
  "name"        text NOT NULL,
  "type"        "chat_room_type" DEFAULT 'group' NOT NULL,
  "village_id"  bigint,
  "created_at"  timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"  timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Reconcile ------------------------------------------------------------------
SELECT gym_cast_column_to_enum('chat_rooms', 'type', 'chat_room_type', 'group');
--> statement-breakpoint

-- Foreign keys ---------------------------------------------------------------
SELECT gym_drop_foreign_keys('chat_rooms', 'village_id');
--> statement-breakpoint
UPDATE "chat_rooms" r SET "village_id" = NULL
 WHERE "village_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "villages" v WHERE v."id" = r."village_id");
--> statement-breakpoint
ALTER TABLE "chat_rooms"
  ADD CONSTRAINT "chat_rooms_village_id_villages_id_fk"
  FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "idx_chat_rooms_village_id" ON "chat_rooms" USING btree ("village_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_rooms_type"       ON "chat_rooms" USING btree ("type");
--> statement-breakpoint

SELECT gym_attach_updated_at('chat_rooms');
