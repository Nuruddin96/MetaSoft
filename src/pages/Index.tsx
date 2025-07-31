import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { VideosSection } from "@/components/VideosSection";
import { PartnersSection } from "@/components/PartnersSection";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CourseCard } from "@/components/CourseCard";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  short_description?: string;
  price: number;
  discounted_price?: number;
  rating: number;
  enrollment_count: number;
  thumbnail_url?: string;
  level: string;
  course_categories?: {
    name: string;
  };
  profiles?: {
    full_name: string;
  };
}

const Index = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllCourses();
  }, []);

  const fetchAllCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          short_description,
          price,
          discounted_price,
          rating,
          enrollment_count,
          thumbnail_url,
          level,
          course_categories (name),
          profiles (full_name)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Hero />
      
      {/* All Courses Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">All Courses</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our complete collection of courses designed to help you master new skills and advance your career.
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-card rounded-lg h-64"></div>
                </div>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course) => (
                <CourseCard 
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  instructor={course.profiles?.full_name || "Unknown"}
                  price={course.price}
                  discounted_price={course.discounted_price}
                  rating={course.rating}
                  enrollment_count={course.enrollment_count}
                  thumbnail_url={course.thumbnail_url}
                  category={course.course_categories?.name || "General"}
                  level={course.level as "beginner" | "intermediate" | "advanced"}
                  short_description={course.short_description}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No courses available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      
      <VideosSection />
      <Features />
      <PartnersSection />
    </div>
  );
};

export default Index;
