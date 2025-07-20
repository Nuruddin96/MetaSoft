-- Add hero section settings to site_settings table
INSERT INTO public.site_settings (key, value, description) VALUES 
  ('hero_title', '"Transform Your Skills with Expert-Led Courses"', 'Main hero title displayed on homepage'),
  ('hero_subtitle', '"Join thousands of students learning from industry experts. Start your journey to success today."', 'Hero subtitle/description'),
  ('hero_cta_text', '"Browse Courses"', 'Call-to-action button text'),
  ('hero_cta_link', '"/courses"', 'Call-to-action button link'),
  ('hero_background_image', '""', 'Hero background image URL'),
  ('hero_enabled', 'true', 'Enable/disable hero section')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description;