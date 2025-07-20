-- Create lessons table for organizing course content
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  parent_lesson_id UUID,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (parent_lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE
);

-- Enable RLS on lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Create policies for lessons
CREATE POLICY "Anyone can view published lessons" 
ON public.lessons 
FOR SELECT 
USING (is_published = true OR get_user_role(auth.uid()) = ANY(ARRAY['admin'::text, 'instructor'::text]));

CREATE POLICY "Instructors can manage lessons" 
ON public.lessons 
FOR ALL 
USING (
  get_user_role(auth.uid()) = 'admin'::text OR 
  (get_user_role(auth.uid()) = 'instructor'::text AND EXISTS (
    SELECT 1 FROM courses c 
    WHERE c.id = lessons.course_id 
    AND c.instructor_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  ))
);

-- Update course_materials to link to lessons instead of directly to courses
ALTER TABLE public.course_materials 
ADD COLUMN lesson_id UUID,
ADD FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX idx_lessons_parent_id ON public.lessons(parent_lesson_id);
CREATE INDEX idx_course_materials_lesson_id ON public.course_materials(lesson_id);

-- Update course materials RLS to work with lessons
DROP POLICY IF EXISTS "Enrolled students can view course materials" ON public.course_materials;
DROP POLICY IF EXISTS "Instructors can manage course materials" ON public.course_materials;

CREATE POLICY "Enrolled students can view course materials" 
ON public.course_materials 
FOR SELECT 
USING (
  is_free = true OR 
  get_user_role(auth.uid()) = ANY(ARRAY['admin'::text, 'instructor'::text]) OR
  (lesson_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM lessons l 
    JOIN enrollments e ON e.course_id = l.course_id
    WHERE l.id = course_materials.lesson_id 
    AND e.student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND e.status = 'active'
  )) OR
  (lesson_id IS NULL AND EXISTS (
    SELECT 1 FROM enrollments e 
    WHERE e.course_id = course_materials.course_id
    AND e.student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND e.status = 'active'
  ))
);

CREATE POLICY "Instructors can manage course materials" 
ON public.course_materials 
FOR ALL 
USING (
  get_user_role(auth.uid()) = 'admin'::text OR 
  (get_user_role(auth.uid()) = 'instructor'::text AND (
    (lesson_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM lessons l 
      JOIN courses c ON c.id = l.course_id
      WHERE l.id = course_materials.lesson_id 
      AND c.instructor_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    )) OR
    (lesson_id IS NULL AND EXISTS (
      SELECT 1 FROM courses c 
      WHERE c.id = course_materials.course_id
      AND c.instructor_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    ))
  ))
);