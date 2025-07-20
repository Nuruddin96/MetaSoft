-- First, ensure the site_settings table exists with proper structure
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (website content should be readable by everyone)
CREATE POLICY "Site settings are viewable by everyone" 
ON public.site_settings 
FOR SELECT 
USING (true);

-- Create policy for admin write access
CREATE POLICY "Only admins can modify site settings" 
ON public.site_settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Insert default settings if they don't exist
INSERT INTO public.site_settings (key, value, description) VALUES
('hero_title', '{"value": "Master E-commerce with MetaSoft BD"}', 'Hero section main title'),
('hero_subtitle', '{"value": "Learn from Bangladesh''s top e-commerce experts. Build your online business with our comprehensive video courses and expert guidance."}', 'Hero section subtitle'),
('hero_cta_text', '{"value": "Explore Courses"}', 'Hero section call to action button text'),
('footer_description', '{"value": "Bangladesh''s premier e-learning platform for e-commerce entrepreneurs. Learn, grow, and succeed with our expert-led courses."}', 'Footer description text'),
('footer_contact_email', '{"value": "info@metasoftbd.com"}', 'Footer contact email'),
('footer_contact_phone', '{"value": "+880 1XXX-XXXXXX"}', 'Footer contact phone'),
('site_name', '{"value": "MetaSoft BD"}', 'Site name'),
('banner_enabled', '{"value": false}', 'Whether banner is enabled'),
('banner_text', '{"value": "Special offer - 50% off all courses!"}', 'Banner announcement text')
ON CONFLICT (key) DO NOTHING;