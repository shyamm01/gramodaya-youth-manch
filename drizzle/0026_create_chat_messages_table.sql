-- ============================================================================
-- 0026 · chat_messages
-- ----------------------------------------------------------------------------
-- One message in a room.
--
-- Normalised here: every message carried sender_name, sender_mobile,
-- sender_photo and sender_member_id — four copies of the sender's profile
-- stamped onto each row. A member who updated their photo or name left every
-- message they had ever sent showing the old one. Replaced by
-- sender_id -> profiles(id); the API joins for the display fields.
--
-- village_id is kept even though it is derivable through room_id, because the
-- realtime subscription filters on it directly and the join would have to
-- happen inside the Supabase replication filter, which it cannot.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "chat_messages" (
  "id"          bigserial PRIMARY KEY NOT NULL,
  "room_id"     text NOT NULL,
  "village_id"  bigint,
  "sender_id"   uuid,
  "text"        text NOT NULL,
  "photo_url"   text,
  "is_read"     boolean DEFAULT false NOT NULL,
  "is_deleted"  boolean DEFAULT false NOT NULL,
  "created_at"  timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Reconcile: resolve the denormalised sender columns into sender_id ----------
ALTER TABLE "chat_messages" ADD COLUMN IF NOT EXISTS "sender_id" uuid;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema='public' AND table_name='chat_messages' AND column_name='sender_mobile') THEN
    UPDATE public.chat_messages cm
       SET sender_id = p.id
      FROM public.profiles p
     WHERE cm.sender_id IS NULL
       AND p.mobile IS NOT NULL
       AND right(regexp_replace(p.mobile, '\D', '', 'g'), 10)
         = right(regexp_replace(cm.sender_mobile, '\D', '', 'g'), 10);
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "chat_messages" DROP COLUMN IF EXISTS "sender_name";
--> statement-breakpoint
ALTER TABLE "chat_messages" DROP COLUMN IF EXISTS "sender_mobile";
--> statement-breakpoint
ALTER TABLE "chat_messages" DROP COLUMN IF EXISTS "sender_photo";
--> statement-breakpoint
ALTER TABLE "chat_messages" DROP COLUMN IF EXISTS "sender_member_id";
--> statement-breakpoint

UPDATE "chat_messages" SET "is_read" = COALESCE("is_read", false);
--> statement-breakpoint
UPDATE "chat_messages" SET "is_deleted" = COALESCE("is_deleted", false);
--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "is_read"    SET DEFAULT false;
--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "is_read"    SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "is_deleted" SET DEFAULT false;
--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "is_deleted" SET NOT NULL;
--> statement-breakpoint

-- Reconcile: client-generated text id -> surrogate bigserial.
DO $$ BEGIN
  IF (SELECT udt_name FROM information_schema.columns
       WHERE table_schema='public' AND table_name='chat_messages' AND column_name='id') = 'text' THEN
    ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_pkey;
    ALTER TABLE public.chat_messages DROP COLUMN id;
    ALTER TABLE public.chat_messages ADD COLUMN id bigserial PRIMARY KEY;
  END IF;
END $$;
--> statement-breakpoint

-- Foreign keys ---------------------------------------------------------------
SELECT gym_drop_foreign_keys('chat_messages', 'room_id');
--> statement-breakpoint
DELETE FROM "chat_messages" m WHERE NOT EXISTS (SELECT 1 FROM "chat_rooms" r WHERE r."id" = m."room_id");
--> statement-breakpoint
ALTER TABLE "chat_messages"
  ADD CONSTRAINT "chat_messages_room_id_chat_rooms_id_fk"
  FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

SELECT gym_drop_foreign_keys('chat_messages', 'village_id');
--> statement-breakpoint
UPDATE "chat_messages" m SET "village_id" = NULL
 WHERE "village_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "villages" v WHERE v."id" = m."village_id");
--> statement-breakpoint
ALTER TABLE "chat_messages"
  ADD CONSTRAINT "chat_messages_village_id_villages_id_fk"
  FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- SET NULL: a deleted account leaves its messages in place, attributed to
-- "पूर्व सदस्य" by the API rather than vanishing from the conversation.
SELECT gym_drop_foreign_keys('chat_messages', 'sender_id');
--> statement-breakpoint
UPDATE "chat_messages" m SET "sender_id" = NULL
 WHERE "sender_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "profiles" p WHERE p."id" = m."sender_id");
--> statement-breakpoint
ALTER TABLE "chat_messages"
  ADD CONSTRAINT "chat_messages_sender_id_profiles_id_fk"
  FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
DROP INDEX IF EXISTS "idx_chat_messages_sender_mobile";
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_messages_room_id"    ON "chat_messages" USING btree ("room_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_messages_village_id" ON "chat_messages" USING btree ("village_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_messages_sender_id"  ON "chat_messages" USING btree ("sender_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_messages_created_at" ON "chat_messages" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_messages_room_created"
  ON "chat_messages" USING btree ("room_id", "created_at");
