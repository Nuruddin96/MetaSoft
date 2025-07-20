-- Add media elements columns to custom_pages table
ALTER TABLE public.custom_pages 
ADD COLUMN banner_enabled boolean DEFAULT false,
ADD COLUMN banner_url text,
ADD COLUMN banner_title text,
ADD COLUMN images_enabled boolean DEFAULT false,
ADD COLUMN images text[], -- Array of image URLs
ADD COLUMN videos_enabled boolean DEFAULT false,
ADD COLUMN videos text[]; -- Array of video URLs/embeds

-- Add social media links to site_settings for footer
INSERT INTO public.site_settings (key, value, description) VALUES
('social_facebook', '""', 'Facebook page URL'),
('social_instagram', '""', 'Instagram profile URL'),  
('social_youtube', '""', 'YouTube channel URL'),
('social_linkedin', '""', 'LinkedIn page URL'),
('social_twitter', '""', 'Twitter/X profile URL')
ON CONFLICT (key) DO NOTHING;