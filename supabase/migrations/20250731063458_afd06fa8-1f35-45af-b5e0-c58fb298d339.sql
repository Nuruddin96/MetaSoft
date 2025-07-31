-- Create table for dynamic features section
CREATE TABLE public.dynamic_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for YouTube videos section
CREATE TABLE public.youtube_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_id TEXT NOT NULL, -- YouTube video ID
  thumbnail_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for company logos/partners
CREATE TABLE public.company_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for dynamic_features
ALTER TABLE public.dynamic_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active features" 
ON public.dynamic_features 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage dynamic features" 
ON public.dynamic_features 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Add RLS policies for youtube_videos
ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active videos" 
ON public.youtube_videos 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage youtube videos" 
ON public.youtube_videos 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Add RLS policies for company_partners
ALTER TABLE public.company_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active partners" 
ON public.company_partners 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage company partners" 
ON public.company_partners 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Add triggers for updated_at
CREATE TRIGGER update_dynamic_features_updated_at
BEFORE UPDATE ON public.dynamic_features
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_youtube_videos_updated_at
BEFORE UPDATE ON public.youtube_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_partners_updated_at
BEFORE UPDATE ON public.company_partners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data for features section
INSERT INTO public.dynamic_features (title, description, icon, order_index) VALUES
('High-Quality Video Lessons', 'Learn from crystal clear HD video content with Bengali subtitles and downloadable resources.', 'Video', 1),
('PDF Books & Resources', 'Access comprehensive PDF guides, workbooks, and resources to complement your learning.', 'FileText', 2),
('Expert Instructors', 'Learn from successful Bangladeshi entrepreneurs who''ve built million-taka businesses.', 'Users', 3),
('Certificates', 'Earn verified certificates upon course completion to showcase your expertise.', 'Award', 4),
('Lifetime Access', 'Once purchased, access your courses anytime, anywhere with no time restrictions.', 'Clock', 5),
('Money-Back Guarantee', '30-day money-back guarantee if you''re not satisfied with the course quality.', 'Shield', 6),
('Mobile Friendly', 'Learn on-the-go with our mobile-optimized platform designed for smartphone users.', 'Smartphone', 7),
('Structured Learning', 'Follow step-by-step modules designed to take you from beginner to expert level.', 'BookOpen', 8),
('Community Support', 'Join our private Facebook group and get support from instructors and fellow students.', 'MessageCircle', 9);

-- Insert site settings for section titles and descriptions
INSERT INTO public.site_settings (key, value, description) VALUES
('features_section_title', '"Why Choose MetaSoft BD?"', 'Title for the features section'),
('features_section_description', '"Everything you need to master e-commerce and build a successful online business in Bangladesh"', 'Description for the features section'),
('videos_section_title', '"Learning Videos"', 'Title for the YouTube videos section'),
('videos_section_description', '"Watch our expert-led tutorials and masterclasses"', 'Description for the YouTube videos section'),
('partners_section_title', '"Our Partners"', 'Title for the company partners section'),
('partners_section_description', '"Trusted by leading companies and organizations"', 'Description for the company partners section');