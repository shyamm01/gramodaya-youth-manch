-- Seed initial states
INSERT INTO "states" ("id", "name", "name_hindi", "code")
VALUES (1, 'Uttar Pradesh', 'उत्तर प्रदेश', 'UP')
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint

-- Seed initial districts
INSERT INTO "districts" ("id", "state_id", "name", "name_hindi")
VALUES 
  (1, 1, 'Hardoi', 'हरदोई'),
  (2, 1, 'Jaunpur', 'जौनपुर')
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint

-- Seed initial Gram Panchayats
INSERT INTO "gram_panchayats" ("id", "district_id", "district_name", "district_name_hindi", "state_id", "state_name", "state_name_hindi", "name", "name_hindi", "block_name", "block_name_hindi", "pincode", "post_office", "is_active")
VALUES 
  (1, 1, 'Hardoi', 'हरदोई', 1, 'Uttar Pradesh', 'उत्तर प्रदेश', 'Bahera', 'बहेरा', 'Hardoi', 'हरदोई', '241125', 'Bahera Rasoolpur', true),
  (2, 2, 'Jaunpur', 'जौनपुर', 1, 'Uttar Pradesh', 'उत्तर प्रदेश', 'Jamua', 'जमुआ', 'Badlapur', 'बदलापुर', '222125', 'Jamua', true),
  (3, 2, 'Jaunpur', 'जौनपुर', 1, 'Uttar Pradesh', 'उत्तर प्रदेश', 'Khetasarai', 'खेतासराय', 'Shahganj', 'शाहगंज', '222139', 'Khetasarai', true)
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint

-- Seed default Village chapter
INSERT INTO "villages" ("id", "slug", "name", "name_hindi", "gram_panchayat_id", "gram_panchayat_name", "gram_panchayat_name_hindi", "district_id", "district_name", "district_name_hindi", "state_id", "state_name", "state_name_hindi", "block_name", "block_name_hindi", "pincode", "post_office", "org_name", "org_name_hindi", "slogan_hindi", "tagline_hindi", "is_active")
VALUES 
  (1, 'rasoolpur', 'Rasoolpur', 'रसूलपुर', 1, 'Bahera', 'बहेरा', 1, 'Hardoi', 'हरदोई', 1, 'Uttar Pradesh', 'उत्तर प्रदेश', 'Hardoi', 'हरदोई', '241125', 'Bahera Rasoolpur', 'Gramodaya Youth Manch - Rasoolpur', 'ग्रामोदय यूथ मंच - रसूलपुर', 'युवा शक्ति • ग्राम विकास • उज्ज्वल भविष्य', 'युवा शक्ति से ग्रामोदय की ओर', true)
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint