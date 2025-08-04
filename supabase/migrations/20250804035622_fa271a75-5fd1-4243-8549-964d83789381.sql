-- Create a table for course levels (dynamic management)
CREATE TABLE IF NOT EXISTS course_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE course_levels ENABLE ROW LEVEL SECURITY;

-- Create policies for course levels
CREATE POLICY "Anyone can view active course levels" 
ON course_levels 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage course levels" 
ON course_levels 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Insert default course levels
INSERT INTO course_levels (name, display_order) VALUES
('beginner', 1),
('intermediate', 2),
('advanced', 3)
ON CONFLICT (name) DO NOTHING;

-- Create trigger for automatic updated_at
CREATE TRIGGER update_course_levels_updated_at
  BEFORE UPDATE ON course_levels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a table for software demos (for services section)
CREATE TABLE IF NOT EXISTS software_demos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  demo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT DEFAULT 'software',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE software_demos ENABLE ROW LEVEL SECURITY;

-- Create policies for software demos
CREATE POLICY "Anyone can view active demos" 
ON software_demos 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage demos" 
ON software_demos 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Create trigger for automatic updated_at
CREATE TRIGGER update_software_demos_updated_at
  BEFORE UPDATE ON software_demos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a table for digital marketing performance data
CREATE TABLE IF NOT EXISTS marketing_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_logo_url TEXT,
  industry TEXT,
  campaign_type TEXT,
  metrics JSONB DEFAULT '{}', -- Store ROI, impressions, engagement, etc.
  results_summary TEXT,
  start_date DATE,
  end_date DATE,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE marketing_performance ENABLE ROW LEVEL SECURITY;

-- Create policies for marketing performance
CREATE POLICY "Anyone can view active marketing performance" 
ON marketing_performance 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage marketing performance" 
ON marketing_performance 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');