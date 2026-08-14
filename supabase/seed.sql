-- Supabase Development Seed Script
-- Used automatically for database population

INSERT INTO public.villages (id, slug, name, name_hindi, gram_panchayat_name, district_name, is_active)
VALUES (1, 'rasoolpur', 'Rasoolpur', 'रसूलपुर', 'Bahera', 'Jaunpur', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert core admins
INSERT INTO public.members (id, village_id, name, mobile, status, role, organization_name, photo_url)
VALUES
  (1, 1, 'Alok Kumar (UPCL)', '8787220423', 'active', 'ADMIN', 'ग्रामोदय यूथ मंच', '/images/alok_profile_1786317857578.jpg'),
  (2, 1, 'Vikash Kumar', '9450706183', 'active', 'ADMIN', 'ग्रामोदय यूथ मंच', '/images/vikash_profile_1786317831617.jpg'),
  (3, 1, 'Rajnish Kumar', '9450706182', 'active', 'ADMIN', 'ग्रामोदय यूथ मंच', '/images/rajnish_profile_1786317842982.jpg'),
  (4, 1, 'Abhishek Kumar (Railway)', '8400488759', 'active', 'ADMIN', 'ग्रामोदय यूथ मंच', '/images/abhishek_profile_1786317869389.jpg')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  photo_url = EXCLUDED.photo_url,
  role = EXCLUDED.role;

SELECT setval(pg_get_serial_sequence('public.villages', 'id'), coalesce(max(id), 1)) FROM public.villages;
SELECT setval(pg_get_serial_sequence('public.members', 'id'), coalesce(max(id), 1)) FROM public.members;
