-- Create image gallery table for homepage
CREATE TABLE public.image_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.image_gallery ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active gallery images" 
ON public.image_gallery 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage gallery images" 
ON public.image_gallery 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Create trigger for timestamps
CREATE TRIGGER update_image_gallery_updated_at
BEFORE UPDATE ON public.image_gallery
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.image_gallery (title, description, image_url, order_index) VALUES
('Software Development', 'Custom software solutions tailored to your business needs', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=300&fit=crop', 1),
('Web Applications', 'Modern and responsive web applications with cutting-edge technology', 'https://images.unsplash.com/photo-1498050108023-4542c06a5843?w=500&h=300&fit=crop', 2),
('Mobile Development', 'Native and cross-platform mobile applications for iOS and Android', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=300&fit=crop', 3),
('UI/UX Design', 'Beautiful and user-friendly interface designs that engage users', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop', 4);