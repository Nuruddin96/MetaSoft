-- Create landing page sections table
CREATE TABLE public.landing_page_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_type TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 1,
  title TEXT,
  content TEXT,
  video_url TEXT,
  image_url TEXT,
  cta_text TEXT,
  cta_url TEXT,
  bullet_points JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer review videos table
CREATE TABLE public.customer_review_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  customer_name TEXT,
  order_index INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create landing page orders table
CREATE TABLE public.landing_page_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT,
  product TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.landing_page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_review_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for landing_page_sections
CREATE POLICY "Anyone can view active landing page sections" 
ON public.landing_page_sections 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage landing page sections" 
ON public.landing_page_sections 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for customer_review_videos
CREATE POLICY "Anyone can view active review videos" 
ON public.customer_review_videos 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage review videos" 
ON public.customer_review_videos 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for landing_page_orders
CREATE POLICY "Anyone can create orders" 
ON public.landing_page_orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage all orders" 
ON public.landing_page_orders 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Add trigger for updated_at
CREATE TRIGGER update_landing_page_sections_updated_at
BEFORE UPDATE ON public.landing_page_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_review_videos_updated_at
BEFORE UPDATE ON public.customer_review_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_landing_page_orders_updated_at
BEFORE UPDATE ON public.landing_page_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();