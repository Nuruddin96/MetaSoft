-- Enhance course materials to better support hierarchical structure
-- Add new columns to support video content and better organization

-- Add new columns to course_materials table for better video support
ALTER TABLE public.course_materials 
ADD COLUMN IF NOT EXISTS video_id TEXT,
ADD COLUMN IF NOT EXISTS video_platform TEXT DEFAULT 'youtube',
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'video',
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS transcript TEXT,
ADD COLUMN IF NOT EXISTS is_preview BOOLEAN DEFAULT false;

-- Add index on lesson_id for better performance
CREATE INDEX IF NOT EXISTS idx_course_materials_lesson_id ON public.course_materials(lesson_id);

-- Add index on order_index for sorting
CREATE INDEX IF NOT EXISTS idx_course_materials_order ON public.course_materials(order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON public.lessons(order_index);

-- Update the RLS policies to ensure proper access control for the new fields
-- (Existing policies should continue to work with the new columns)

-- Add a function to automatically update lesson order when new lessons are added
CREATE OR REPLACE FUNCTION public.update_lesson_order()
RETURNS TRIGGER AS $$
BEGIN
  -- If no order_index is provided, set it to be the last one
  IF NEW.order_index IS NULL THEN
    NEW.order_index := COALESCE(
      (SELECT MAX(order_index) + 1 
       FROM public.lessons 
       WHERE course_id = NEW.course_id 
       AND COALESCE(parent_lesson_id, '') = COALESCE(NEW.parent_lesson_id, '')), 
      1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic lesson ordering
DROP TRIGGER IF EXISTS trigger_update_lesson_order ON public.lessons;
CREATE TRIGGER trigger_update_lesson_order
  BEFORE INSERT ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lesson_order();

-- Add a function to automatically update material order when new materials are added
CREATE OR REPLACE FUNCTION public.update_material_order()
RETURNS TRIGGER AS $$
BEGIN
  -- If no order_index is provided, set it to be the last one
  IF NEW.order_index IS NULL THEN
    NEW.order_index := COALESCE(
      (SELECT MAX(order_index) + 1 
       FROM public.course_materials 
       WHERE COALESCE(lesson_id::text, '') = COALESCE(NEW.lesson_id::text, '')
       AND course_id = NEW.course_id), 
      1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic material ordering
DROP TRIGGER IF EXISTS trigger_update_material_order ON public.course_materials;
CREATE TRIGGER trigger_update_material_order
  BEFORE INSERT ON public.course_materials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_material_order();