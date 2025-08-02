-- Create services table for homepage display
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active services" 
ON public.services 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage services" 
ON public.services 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Insert default services
INSERT INTO public.services (name, description, icon, order_index) VALUES
('Software Development', 'Custom software solutions for your business needs', 'Code', 1),
('Online Courses', 'Comprehensive learning paths in technology and business', 'BookOpen', 2),
('E-books', 'Digital learning materials and guides', 'Book', 3),
('Consulting Services', 'Expert advice and strategic guidance', 'Users', 4),
('Digital Marketing', 'Boost your online presence and reach', 'TrendingUp', 5),
('Technical Support', '24/7 technical assistance and maintenance', 'HeadphonesIcon', 6);

-- Add lesson_id to course_materials for sub-materials functionality
ALTER TABLE public.course_materials 
ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.lessons(id);

-- Create trigger for automatic timestamp updates on services
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();