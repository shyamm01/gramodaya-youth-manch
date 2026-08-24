-- ============================================================================
-- 0025 · chat_members
-- ----------------------------------------------------------------------------
-- Membership of a person in a room, plus their per-room read cursor.
--
-- Normalised here: the table carried `member_id text`, `mobile` and `name`
-- copies of the person's profile. Those are facts about the person, not about
-- their membership, and they went stale the moment someone changed their name.
-- Replaced by user_id -> profiles(id); the room-scoped `role` stays, because a
-- moderator of one room is an ordinary member of another.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "chat_members" (
  "id"            bigserial PRIMARY KEY NOT NULL,
  "room_id"       text NOT NULL,
  "user_id"       uuid NOT NULL,
  "role"          "chat_member_role" DEFAULT 'member' NOT NULL,
  "joined_at"     timestamp with time zone DEFAULT now() NOT NULL,
  "last_read_at"  timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Reconcile: resolve the denormalised identity columns into user_id ----------
ALTER TABLE "chat_members" ADD COLUMN IF NOT EXISTS "user_id" uuid;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema='public' AND table_name='chat_members' AND column_name='mobile') THEN
    UPDATE public.chat_members cm
       SET user_id = p.id
      FROM public.profiles p
     WHERE cm.user_id IS NULL
       AND p.mobile IS NOT NULL
       AND right(regexp_replace(p.mobile, '\D', '', 'g'), 10)
         = right(regexp_replace(cm.mobile, '\D', '', 'g'), 10);
  END IF;
END $$;
--> statement-breakpoint
-- A membership row that cannot be tied to a profile is not a membership.
DELETE FROM "chat_members" WHERE "user_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "chat_members" DROP COLUMN IF EXISTS "member_id";
--> statement-breakpoint
ALTER TABLE "chat_members" DROP COLUMN IF EXISTS "mobile";
--> statement-breakpoint
ALTER TABLE "chat_members" DROP COLUMN IF EXISTS "name";
--> statement-breakpoint
SELECT gym_cast_column_to_enum('chat_members', 'role', 'chat_member_role', 'member');
--> statement-breakpoint
ALTER TABLE "chat_members" ALTER COLUMN "user_id" SET NOT NULL;
--> statement-breakpoint

-- Reconcile: the text primary key was a client-generated string; a surrogate
-- bigserial plus the natural key (room_id, user_id) below is the correct shape.
DO $$ BEGIN
  IF (SELECT udt_name FROM information_schema.columns
       WHERE table_schema='public' AND table_name='chat_members' AND column_name='id') = 'text' THEN
    ALTER TABLE public.chat_members DROP CONSTRAINT IF EXISTS chat_members_pkey;
    ALTER TABLE public.chat_members DROP COLUMN id;
    ALTER TABLE public.chat_members ADD COLUMN id bigserial PRIMARY KEY;
  END IF;
END $$;
--> statement-breakpoint

-- One membership row per person per room.
DELETE FROM "chat_members" a USING "chat_members" b
 WHERE a."id" > b."id" AND a."room_id" = b."room_id" AND a."user_id" = b."user_id";
--> statement-breakpoint

-- Foreign keys ---------------------------------------------------------------
SELECT gym_drop_foreign_keys('chat_members', 'room_id');
--> statement-breakpoint
DELETE FROM "chat_members" m WHERE NOT EXISTS (SELECT 1 FROM "chat_rooms" r WHERE r."id" = m."room_id");
--> statement-breakpoint
ALTER TABLE "chat_members"
  ADD CONSTRAINT "chat_members_room_id_chat_rooms_id_fk"
  FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

SELECT gym_drop_foreign_keys('chat_members', 'user_id');
--> statement-breakpoint
DELETE FROM "chat_members" m WHERE NOT EXISTS (SELECT 1 FROM "profiles" p WHERE p."id" = m."user_id");
--> statement-breakpoint
ALTER TABLE "chat_members"
  ADD CONSTRAINT "chat_members_user_id_profiles_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Indexes --------------------------------------------------------------------
DROP INDEX IF EXISTS "idx_chat_members_member_id";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_chat_members_mobile";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_chat_members_room_user";
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_chat_members_room_user"
  ON "chat_members" USING btree ("room_id", "user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_members_room_id" ON "chat_members" USING btree ("room_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_members_user_id" ON "chat_members" USING btree ("user_id");
