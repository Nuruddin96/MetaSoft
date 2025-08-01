-- Create about page content table for dynamic about page management
CREATE TABLE public.about_page_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key text NOT NULL UNIQUE,
  title text,
  subtitle text,
  content text,
  stats jsonb,
  team_members jsonb,
  values jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.about_page_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view about page content" 
ON public.about_page_content 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage about page content" 
ON public.about_page_content 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Add trigger for timestamps
CREATE TRIGGER update_about_page_content_updated_at
BEFORE UPDATE ON public.about_page_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content
INSERT INTO public.about_page_content (section_key, title, subtitle, content, stats, team_members, values) VALUES
('hero', 'About Our Platform', null, 'We''re on a mission to make quality education accessible to everyone, anywhere in the world. Join millions of learners who are transforming their careers and lives through our comprehensive courses.', null, null, null),
('mission', 'Our Mission', null, 'We believe that education is the key to unlocking human potential. Our platform provides world-class courses designed by industry experts, making it easy for anyone to learn new skills, advance their careers, and achieve their goals.', null, null, null),
('stats', null, null, null, '[{"label": "Students", "value": "10,000+", "icon": "Users"}, {"label": "Courses", "value": "200+", "icon": "BookOpen"}, {"label": "Certificates", "value": "5,000+", "icon": "Award"}, {"label": "Rating", "value": "4.9/5", "icon": "Star"}]', null, null),
('values', null, null, null, null, null, '[{"title": "Excellence", "description": "We strive for excellence in every course, ensuring high-quality content and engaging learning experiences.", "icon": "Target"}, {"title": "Accessibility", "description": "Education should be accessible to everyone. We provide affordable courses with lifetime access.", "icon": "Heart"}, {"title": "Community", "description": "Learn together with our vibrant community of students and expert instructors from around the world.", "icon": "Users"}]'),
('team', 'Meet Our Team', 'Our team of passionate educators and industry experts are committed to delivering the best learning experience.', null, null, '[{"name": "John Doe", "role": "Founder & CEO", "description": "Passionate educator with 15+ years of experience in online learning platforms."}, {"name": "Jane Smith", "role": "Head of Curriculum", "description": "Expert in educational technology and curriculum development with a focus on practical skills."}, {"name": "Mike Johnson", "role": "Lead Instructor", "description": "Industry veteran with extensive experience in teaching and mentoring students worldwide."}]', null),
('cta', 'Ready to Start Learning?', 'Join thousands of students who are already transforming their careers with our comprehensive courses.', null, null, null, null);