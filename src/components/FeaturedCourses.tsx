
import { useState, useEffect } from "react";
import { CourseCard } from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  short_description?: string;
  price: number;
  discounted_price?: number;
  rating: number;
  enrollment_count: number;
  duration_hours?: number;
  thumbnail_url?: string;
  level: "beginner" | "intermediate" | "advanced";
  course_categories?: {
    name: string;
  };
  profiles?: {
    full_name: string;
  };
}

export const FeaturedCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeaturedCourses();
  }, []);

  const fetchFeaturedCourses = async () => {
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
          duration_hours,
          thumbnail_url,
          level,
          course_categories (name),
          profiles (full_name)
        `)
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setCourses((data || []) as Course[]);
    } catch (error) {
      console.error('Error fetching featured courses:', error);
      toast({
        title: "Error",
        description: "Failed to load featured courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Courses
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Master e-commerce with our most popular courses designed specifically for Bangladeshi entrepreneurs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg h-96 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured Courses
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Master e-commerce with our most popular courses designed specifically for Bangladeshi entrepreneurs
          </p>
        </div>
        
        {courses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {courses.map((course) => (
              <CourseCard 
                key={course.id} 
                id={course.id}
                title={course.title}
                instructor={course.profiles?.full_name || "Unknown Instructor"}
                price={course.price}
                discounted_price={course.discounted_price || undefined}
                rating={course.rating}
                enrollment_count={course.enrollment_count}
                duration_hours={course.duration_hours}
                thumbnail_url={course.thumbnail_url || undefined}
                category={course.course_categories?.name || "General"}
                level={course.level}
                short_description={course.short_description}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No featured courses available at the moment.
            </p>
          </div>
        )}
        
        <div className="text-center">
          <Button size="lg" variant="outline" asChild>
            <Link to="/courses">
              View All Courses
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
