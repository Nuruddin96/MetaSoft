import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LessonManagement from '@/components/admin/LessonManagement';
import { CourseMaterialsManager } from '@/components/admin/CourseMaterialsManager';

interface Course {
  id: string;
  title: string;
  description: string;
  is_published: boolean;
  enrollment_count: number;
  course_categories?: {
    name: string;
  };
}

export default function CourseDetailsManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          is_published,
          enrollment_count,
          course_categories (name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setCourse(data);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast({
        title: "Error",
        description: "Failed to load course details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!course) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <h2 className="text-xl font-semibold">Course Not Found</h2>
          <Button onClick={() => navigate('/admin/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/admin/courses')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <p className="text-muted-foreground">
                {course.course_categories?.name} • {course.enrollment_count} students
              </p>
            </div>
          </div>
        </div>

        {/* Course Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Course Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{course.description}</p>
          </CardContent>
        </Card>

        {/* Tabs for different management sections */}
        <Tabs defaultValue="lessons" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lessons">Lessons & Structure</TabsTrigger>
            <TabsTrigger value="materials">Legacy Materials</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lessons" className="space-y-6">
            <LessonManagement courseId={course.id} />
          </TabsContent>
          
          <TabsContent value="materials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Legacy Course Materials</CardTitle>
                <p className="text-sm text-muted-foreground">
                  These are materials not yet organized into lessons. Consider organizing them into the new lesson structure.
                </p>
              </CardHeader>
              <CardContent>
                <CourseMaterialsManager courseId={course.id} courseName={course.title} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}