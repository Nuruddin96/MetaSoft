-- Create a table for custom pages
CREATE TABLE public.custom_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view published pages" 
ON public.custom_pages 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage all pages" 
ON public.custom_pages 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_custom_pages_updated_at
BEFORE UPDATE ON public.custom_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();