-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'instructor', 'student')),
  bio TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create course categories table
CREATE TABLE public.course_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.course_categories(id) ON DELETE SET NULL,
  price DECIMAL(10,2) DEFAULT 0,
  discounted_price DECIMAL(10,2),
  duration_hours INTEGER,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  thumbnail_url TEXT,
  video_preview_url TEXT,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[],
  requirements TEXT[],
  what_you_learn TEXT[],
  slug TEXT UNIQUE NOT NULL,
  enrollment_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create course materials table
CREATE TABLE public.course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('video', 'pdf', 'document', 'quiz', 'assignment')),
  file_url TEXT,
  file_size BIGINT,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create enrollments table
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  progress DECIMAL(5,2) DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended')),
  UNIQUE(student_id, course_id)
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BDT',
  payment_method TEXT,
  transaction_id TEXT UNIQUE,
  stripe_session_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create course reviews table
CREATE TABLE public.course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, student_id)
);

-- Create site settings table for dynamic configuration
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Course categories policies (public read, admin write)
CREATE POLICY "Anyone can view course categories" ON public.course_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage course categories" ON public.course_categories
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Courses policies
CREATE POLICY "Anyone can view published courses" ON public.courses
  FOR SELECT USING (is_published = true OR public.get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "Instructors can manage own courses" ON public.courses
  FOR ALL USING (
    public.get_user_role(auth.uid()) = 'admin' OR 
    (public.get_user_role(auth.uid()) = 'instructor' AND instructor_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  );

-- Course materials policies
CREATE POLICY "Enrolled students can view course materials" ON public.course_materials
  FOR SELECT USING (
    is_free = true OR
    public.get_user_role(auth.uid()) IN ('admin', 'instructor') OR
    EXISTS (
      SELECT 1 FROM public.enrollments e 
      WHERE e.course_id = course_materials.course_id 
      AND e.student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      AND e.status = 'active'
    )
  );

CREATE POLICY "Instructors can manage course materials" ON public.course_materials
  FOR ALL USING (
    public.get_user_role(auth.uid()) = 'admin' OR
    (public.get_user_role(auth.uid()) = 'instructor' AND EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = course_materials.course_id 
      AND c.instructor_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    ))
  );

-- Enrollments policies
CREATE POLICY "Students can view own enrollments" ON public.enrollments
  FOR SELECT USING (
    student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('admin', 'instructor')
  );

CREATE POLICY "Students can enroll in courses" ON public.enrollments
  FOR INSERT WITH CHECK (student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all enrollments" ON public.enrollments
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (
    user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Users can create payments" ON public.payments
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all payments" ON public.payments
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Course reviews policies
CREATE POLICY "Anyone can view course reviews" ON public.course_reviews
  FOR SELECT USING (true);

CREATE POLICY "Enrolled students can create reviews" ON public.course_reviews
  FOR INSERT WITH CHECK (
    student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.enrollments e 
      WHERE e.course_id = course_reviews.course_id 
      AND e.student_id = student_id
    )
  );

CREATE POLICY "Students can update own reviews" ON public.course_reviews
  FOR UPDATE USING (student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Site settings policies
CREATE POLICY "Anyone can view site settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update course statistics
CREATE OR REPLACE FUNCTION public.update_course_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update enrollment count
  UPDATE public.courses 
  SET enrollment_count = (
    SELECT COUNT(*) FROM public.enrollments 
    WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
    AND status = 'active'
  )
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for course statistics
CREATE TRIGGER update_course_enrollment_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_course_stats();

-- Create function to update course ratings
CREATE OR REPLACE FUNCTION public.update_course_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.courses 
  SET 
    rating = (
      SELECT ROUND(AVG(rating)::numeric, 2) 
      FROM public.course_reviews 
      WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM public.course_reviews 
      WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
    )
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for course ratings
CREATE TRIGGER update_course_rating_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.course_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_course_rating();

-- Insert default site settings
INSERT INTO public.site_settings (key, value, description) VALUES
  ('site_name', '"MetaSoft BD"', 'Website name'),
  ('site_description', '"Premium E-Learning Platform"', 'Website description'),
  ('contact_email', '"info@metasoftbd.com"', 'Contact email'),
  ('contact_phone', '"+880-XXX-XXXXXX"', 'Contact phone'),
  ('social_facebook', '"https://facebook.com/metasoftbd"', 'Facebook URL'),
  ('social_youtube', '"https://youtube.com/metasoftbd"', 'YouTube URL'),
  ('currency', '"BDT"', 'Default currency'),
  ('featured_courses_count', '6', 'Number of featured courses to show'),
  ('enable_reviews', 'true', 'Enable course reviews'),
  ('enable_enrollment', 'true', 'Enable course enrollment');

-- Insert default course categories
INSERT INTO public.course_categories (name, description, slug, icon) VALUES
  ('Web Development', 'Learn modern web development technologies', 'web-development', 'Code'),
  ('Data Science', 'Master data analysis and machine learning', 'data-science', 'BarChart'),
  ('Mobile Development', 'Build iOS and Android applications', 'mobile-development', 'Smartphone'),
  ('Digital Marketing', 'Learn online marketing strategies', 'digital-marketing', 'TrendingUp'),
  ('Graphic Design', 'Master visual design and creativity', 'graphic-design', 'Palette'),
  ('Business & Management', 'Develop business and leadership skills', 'business-management', 'Briefcase');