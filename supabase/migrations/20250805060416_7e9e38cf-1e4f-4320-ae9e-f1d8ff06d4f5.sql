-- Create e-books table
CREATE TABLE public.ebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  file_url TEXT,
  price NUMERIC DEFAULT 0,
  author TEXT,
  pages INTEGER,
  category TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;

-- Create policies for e-books
CREATE POLICY "Anyone can view published ebooks" 
ON public.ebooks 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage ebooks" 
ON public.ebooks 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Create support tickets table
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  assigned_to UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for support tickets
CREATE POLICY "Users can view own tickets" 
ON public.support_tickets 
FOR SELECT 
USING (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create tickets" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all tickets" 
ON public.support_tickets 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Create bKash payment callback function to handle successful payments
CREATE OR REPLACE FUNCTION handle_bkash_payment_success()
RETURNS TRIGGER AS $$
BEGIN
  -- When payment status changes to 'completed', create enrollment
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Create enrollment record
    INSERT INTO public.enrollments (student_id, course_id, enrolled_at, status)
    VALUES (NEW.user_id, NEW.course_id, now(), 'active')
    ON CONFLICT (student_id, course_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payment completion
CREATE TRIGGER on_payment_completed
  AFTER UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION handle_bkash_payment_success();

-- Add triggers for updated_at columns
CREATE TRIGGER update_ebooks_updated_at
  BEFORE UPDATE ON public.ebooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();