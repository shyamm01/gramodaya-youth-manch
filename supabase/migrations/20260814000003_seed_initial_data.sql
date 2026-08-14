-- Migration: 20260814000003_seed_initial_data.sql
-- Description: Seed initial Admins and official village announcements with auto-increment IDs

-- 1. Seed Main Admins
INSERT INTO public.members (id, name, mobile, status, role, organization_name, photo_url)
VALUES
  (1, 'Alok Kumar (UPCL)', '+91 87872 20423', 'active', 'ADMIN', 'ग्रामोदय यूथ मंच', '/images/alok_profile_1786317857578.jpg'),
  (2, 'Vikash Kumar', '+91 94507 06183', 'active', 'ADMIN', 'ग्रामोदय यूथ मंच', '/images/vikash_profile_1786317831617.jpg'),
  (3, 'Rajnish Kumar', '+91 94507 06182', 'active', 'ADMIN', 'ग्रामोदय यूथ मंच', '/images/rajnish_profile_1786317842982.jpg'),
  (4, 'Abhishek Kumar (Railway)', '+91 84004 88759', 'active', 'ADMIN', 'ग्रामोदय यूथ मंच', '/images/abhishek_profile_1786317869389.jpg')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  mobile = EXCLUDED.mobile,
  role = EXCLUDED.role;

-- 2. Seed Baseline Announcement
INSERT INTO public.announcements (id, title, content, published_by, date)
VALUES
  (
    1,
    'ग्रामोदय यूथ मंच - आधिकारिक स्थापना सूचना',
    'ग्रामोदय यूथ मंच रसूलपुर, ग्राम पंचायत बहेरा में युवा शक्ति और ग्राम विकास हेतु प्रतिबद्ध है। सभी सदस्य एकजुट होकर गांव की प्रगति में सहयोग करें।',
    'Alok Kumar (UPCL)',
    CURRENT_DATE
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content;

SELECT setval(pg_get_serial_sequence('public.members', 'id'), coalesce(max(id), 1)) FROM public.members;
SELECT setval(pg_get_serial_sequence('public.announcements', 'id'), coalesce(max(id), 1)) FROM public.announcements;
