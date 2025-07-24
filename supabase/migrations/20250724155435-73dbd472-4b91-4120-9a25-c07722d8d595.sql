-- Create hero_banners table for multiple sliding banners
CREATE TABLE public.hero_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  background_image TEXT,
  cta_text TEXT DEFAULT 'Get Started',
  cta_link TEXT DEFAULT '/courses',
  order_index INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

-- Create policies for hero_banners
CREATE POLICY "Hero banners are viewable by everyone" 
ON public.hero_banners 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage hero banners" 
ON public.hero_banners 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_hero_banners_updated_at
BEFORE UPDATE ON public.hero_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default banner data
INSERT INTO public.hero_banners (title, subtitle, background_image, cta_text, cta_link, order_index) VALUES
('Transform Your Future with Expert-Led Courses', 'Join thousands of students learning from industry professionals. Start your journey today with our comprehensive course catalog.', '/placeholder.svg', 'Explore Courses', '/courses', 1),
('Master New Skills at Your Own Pace', 'Access high-quality video content, interactive exercises, and personalized learning paths designed for your success.', '/placeholder.svg', 'Start Learning', '/courses', 2);