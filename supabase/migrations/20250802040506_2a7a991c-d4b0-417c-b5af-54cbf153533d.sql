-- Create site_branding table for header logo and name management
CREATE TABLE IF NOT EXISTS public.site_branding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name TEXT NOT NULL DEFAULT 'MetaSoft BD',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_branding ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Site branding is viewable by everyone" 
ON public.site_branding 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can update site branding" 
ON public.site_branding 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Insert default data
INSERT INTO public.site_branding (site_name, logo_url) 
VALUES ('MetaSoft BD', NULL)
ON CONFLICT DO NOTHING;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_site_branding_updated_at
BEFORE UPDATE ON public.site_branding
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();