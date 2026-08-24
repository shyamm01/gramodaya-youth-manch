-- ============================================================================
-- 0032 · REFERENCE DATA SEED
-- ----------------------------------------------------------------------------
-- The rows the application cannot start without: the geography chain down to
-- the Rasoolpur chapter, and the module catalogue that permissions reference.
--
-- Every insert matches on the table's natural key (states.code, villages.slug,
-- modules.slug, and the district/panchayat name-within-parent keys added in
-- 0003/0004) and resolves foreign keys by lookup. The old seed hard-coded
-- `id` values, which collided with the identity sequences on any database
-- where the rows had already been created — the live chapter is village id 8,
-- not the id 1 that seed assumed.
--
-- Content seeding (education resources, demo grievances) stays in the
-- `bun run db:seed` scripts; only structural prerequisites belong in a
-- migration.
-- ============================================================================

-- States ---------------------------------------------------------------------
INSERT INTO "states" ("name", "name_hindi", "code")
VALUES ('Uttar Pradesh', 'उत्तर प्रदेश', 'UP')
ON CONFLICT ("code") DO UPDATE
  SET "name" = EXCLUDED."name", "name_hindi" = EXCLUDED."name_hindi";
--> statement-breakpoint

-- Districts ------------------------------------------------------------------
INSERT INTO "districts" ("state_id", "name", "name_hindi")
SELECT s."id", v."name", v."name_hindi"
  FROM (VALUES ('Hardoi', 'हरदोई'), ('Jaunpur', 'जौनपुर')) AS v("name", "name_hindi")
  JOIN "states" s ON s."code" = 'UP'
ON CONFLICT ("state_id", lower("name")) DO UPDATE
  SET "name_hindi" = EXCLUDED."name_hindi";
--> statement-breakpoint

-- Gram panchayats ------------------------------------------------------------
INSERT INTO "gram_panchayats"
  ("district_id", "name", "name_hindi", "block_name", "block_name_hindi", "pincode", "post_office", "is_active")
SELECT d."id", v."name", v."name_hindi", v."block_name", v."block_name_hindi", v."pincode", v."post_office", true
  FROM (VALUES
    ('Hardoi',  'Bahera',     'बहेरा',     'Hardoi',   'हरदोई',   '241125', 'Bahera Rasoolpur'),
    ('Jaunpur', 'Jamua',      'जमुआ',      'Badlapur', 'बदलापुर', '222125', 'Jamua'),
    ('Jaunpur', 'Khetasarai', 'खेतासराय',  'Shahganj', 'शाहगंज',  '222139', 'Khetasarai')
  ) AS v("district", "name", "name_hindi", "block_name", "block_name_hindi", "pincode", "post_office")
  JOIN "states" s ON s."code" = 'UP'
  JOIN "districts" d ON d."state_id" = s."id" AND lower(d."name") = lower(v."district")
ON CONFLICT ("district_id", lower("name")) DO UPDATE
  SET "name_hindi"       = EXCLUDED."name_hindi",
      "block_name"       = EXCLUDED."block_name",
      "block_name_hindi" = EXCLUDED."block_name_hindi",
      "pincode"          = EXCLUDED."pincode",
      "post_office"      = EXCLUDED."post_office";
--> statement-breakpoint

-- Village chapter -------------------------------------------------------------
-- DO NOTHING on conflict, not DO UPDATE: the live chapter's branding is edited
-- from the admin UI and a migration must not overwrite it.
INSERT INTO "villages"
  ("slug", "name", "name_hindi", "gram_panchayat_id", "block_name", "block_name_hindi",
   "pincode", "post_office", "org_name", "org_name_hindi", "is_active")
SELECT 'rasoolpur', 'Rasoolpur', 'रसूलपुर', g."id", 'Hardoi', 'हरदोई',
       '241125', 'Bahera Rasoolpur',
       'Gramodaya Youth Manch - Rasoolpur', 'ग्रामोदय यूथ मंच - रसूलपुर', true
  FROM "gram_panchayats" g
  JOIN "districts" d ON d."id" = g."district_id"
  JOIN "states" s ON s."id" = d."state_id"
 WHERE s."code" = 'UP' AND lower(d."name") = 'hardoi' AND lower(g."name") = 'bahera'
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint

-- Module catalogue ------------------------------------------------------------
-- Slugs are immutable (0007 enforces it) and are what user_permissions rows and
-- the requireAuth() checks address, so this list is the contract.
INSERT INTO "modules" ("slug", "name", "name_hindi", "icon", "description", "display_order", "is_active")
VALUES
  ('village',       'Village Management',            'ग्राम प्रबंधन',              'Building2',      'Multi-village governance, chapter configurations, and geographical units', 1,  true),
  ('members',       'Members & Approvals',           'सदस्यता एवं अनुमोदन',        'Users',          'Member directory, verification workflows, and role assignments',           2,  true),
  ('complaints',    'Complaints & Grievances',       'जन समस्या एवं शिकायत निवारण', 'AlertCircle',    'Grievance logging, administrative triage, and status resolution',          3,  true),
  ('social_works',  'Social Development Works',      'सामाजिक विकास कार्य',        'HeartHandshake', 'Community welfare initiatives, development projects, and ground impact',   4,  true),
  ('events',        'Village Events',                'ग्राम कार्यक्रम व सभाएं',      'Calendar',       'Community meetings, festival gatherings, and program scheduling',          5,  true),
  ('gallery',       'Media Gallery',                 'चित्रशाला एवं मीडिया',        'Image',          'Photo and media archive, event snapshots, and village gallery',            6,  true),
  ('announcements', 'Announcements & Alerts',        'सूचना एवं प्रसारण',           'Megaphone',      'Official public notices, alerts, and village broadcasts',                   7,  true),
  ('public_info',   'Public Information Board',      'सार्वजनिक सूचना पट्ट',        'FileText',       'Transparency reports, public documents, and civic notices',                8,  true),
  ('elders',        'Elder Care & Respect',          'बुजुर्ग सम्मान एवं देखरेख',    'UserCheck',      'Senior citizen directory, honors, and elder care assistance',              9,  true),
  ('education',     'Education & Career Guidance',   'शिक्षा एवं मार्गदर्शन',        'GraduationCap',  'Scholarships, government schemes, and career counseling',                  10, true),
  ('chat',          'Community Live Chat',           'सामुदायिक लाइव चैट',          'MessageSquare',  'Real-time community discussions and direct communication',                 11, true),
  ('audit',         'Audit & Activity Logs',         'ऑडिट एवं गतिविधि लॉग्स',       'Activity',       'Security tracking, administrative activity history, and audit logs',       12, true),
  ('settings',      'Settings & Permissions Matrix', 'सिस्टम सेटिंग्स व अनुमतियां',   'Settings',       'User permissions matrix and system configuration settings',                13, true)
ON CONFLICT ("slug") DO UPDATE
  SET "name"          = EXCLUDED."name",
      "name_hindi"    = EXCLUDED."name_hindi",
      "icon"          = EXCLUDED."icon",
      "description"   = EXCLUDED."description",
      "display_order" = EXCLUDED."display_order";
--> statement-breakpoint

-- Default community room ------------------------------------------------------
INSERT INTO "chat_rooms" ("id", "name", "type", "village_id")
SELECT 'general', 'General Discussion', 'group'::"chat_room_type", v."id"
  FROM "villages" v WHERE v."slug" = 'rasoolpur'
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint

-- Identity sequences ----------------------------------------------------------
-- The retired seed inserted explicit ids, which left every bigserial sequence
-- behind its table's max(id); the next natural insert then failed on a
-- duplicate key. Re-align them all.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'states', 'districts', 'gram_panchayats', 'villages', 'modules',
    'user_permissions', 'user_village_roles',
    'complaint_categories', 'complaints', 'complaint_attachments', 'complaint_status_history',
    'social_works', 'events', 'gallery', 'elders', 'announcements', 'public_infos',
    'education_categories', 'education_resources', 'education_resource_links', 'education_enquiries',
    'chat_members', 'chat_messages', 'audit_logs'
  ]
  LOOP
    IF pg_get_serial_sequence('public.' || t, 'id') IS NOT NULL THEN
      EXECUTE format(
        'SELECT setval(%L, COALESCE((SELECT max(id) FROM public.%I), 0) + 1, false)',
        pg_get_serial_sequence('public.' || t, 'id'), t
      );
    END IF;
  END LOOP;
END $$;
