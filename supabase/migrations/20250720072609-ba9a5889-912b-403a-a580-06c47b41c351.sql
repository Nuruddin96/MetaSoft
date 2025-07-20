-- Create storage buckets for course materials
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('course-materials', 'course-materials', false),
  ('course-thumbnails', 'course-thumbnails', true);

-- Create storage policies for course materials (private bucket)
CREATE POLICY "Authenticated users can view course materials" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'course-materials' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Admins and instructors can upload course materials" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'course-materials' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'instructor')
  )
);

CREATE POLICY "Admins and instructors can update course materials" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'course-materials' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'instructor')
  )
);

CREATE POLICY "Admins and instructors can delete course materials" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'course-materials' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'instructor')
  )
);

-- Create storage policies for course thumbnails (public bucket)
CREATE POLICY "Anyone can view course thumbnails" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'course-thumbnails');

CREATE POLICY "Admins and instructors can upload course thumbnails" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'course-thumbnails' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'instructor')
  )
);

CREATE POLICY "Admins and instructors can update course thumbnails" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'course-thumbnails' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'instructor')
  )
);

CREATE POLICY "Admins and instructors can delete course thumbnails" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'course-thumbnails' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'instructor')
  )
);