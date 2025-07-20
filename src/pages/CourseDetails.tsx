import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star, Clock, Users, BookOpen, ArrowLeft, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  description?: string;
  short_description?: string;
  price: number;
  discounted_price?: number;
  rating: number;
  enrollment_count: number;
  duration_hours?: number;
  thumbnail_url?: string;
  video_preview_url?: string;
  level: string;
  what_you_learn?: string[];
  requirements?: string[];
  course_categories?: {
    name: string;
  };
  profiles?: {
    full_name: string;
    bio?: string;
    avatar_url?: string;
  };
}

export default function CourseDetails() {
  const { id } = useParams();
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
          short_description,
          price,
          discounted_price,
          rating,
          enrollment_count,
          duration_hours,
          thumbnail_url,
          video_preview_url,
          level,
          what_you_learn,
          requirements,
          course_categories (name),
          profiles (full_name, bio, avatar_url)
        `)
        .eq('id', id)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      setCourse(data as Course);
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
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-card rounded w-32" />
            <div className="h-64 bg-card rounded" />
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <div className="h-6 bg-card rounded w-3/4" />
                <div className="h-4 bg-card rounded w-full" />
                <div className="h-4 bg-card rounded w-5/6" />
              </div>
              <div className="h-96 bg-card rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The course you're looking for doesn't exist or isn't published.
          </p>
          <Button asChild>
            <Link to="/courses">Browse All Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/courses">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Link>
        </Button>

        {/* Course Header */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="mb-4">
              <Badge variant="secondary" className="mb-2">
                {course.course_categories?.name || "General"}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">
                {course.short_description}
              </p>
            </div>

            {/* Course Stats */}
            <div className="flex flex-wrap gap-6 mb-6">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-current mr-2" />
                <span className="font-medium">{course.rating.toFixed(1)}</span>
                <span className="text-muted-foreground ml-1">
                  ({course.enrollment_count.toLocaleString()} students)
                </span>
              </div>
              
              {course.duration_hours && (
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                  <span>{course.duration_hours} hours</span>
                </div>
              )}

              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="capitalize">{course.level}</span>
              </div>
            </div>

            {/* Instructor Info */}
            {course.profiles && (
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{course.profiles.full_name}</p>
                  <p className="text-sm text-muted-foreground">Instructor</p>
                </div>
              </div>
            )}
          </div>

          {/* Course Thumbnail & Enrollment */}
          <div>
            <Card>
              <CardContent className="p-0">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-primary rounded-t-lg flex items-center justify-center">
                    <Play className="h-12 w-12 text-primary-foreground" />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="mb-4">
                    {course.discounted_price ? (
                      <>
                        <div className="text-3xl font-bold text-primary mb-1">
                          ৳{course.discounted_price.toLocaleString()}
                        </div>
                        <div className="text-lg text-muted-foreground line-through">
                          ৳{course.price.toLocaleString()}
                        </div>
                      </>
                    ) : (
                      <div className="text-3xl font-bold text-primary">
                        ৳{course.price.toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  <Button size="lg" className="w-full bg-gradient-primary hover:opacity-90" asChild>
                    <Link to={`/checkout/${course.id}`}>Enroll Now</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Course Content */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            {course.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About This Course</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{course.description}</p>
                </CardContent>
              </Card>
            )}

            {/* What You'll Learn */}
            {course.what_you_learn && course.what_you_learn.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>What You'll Learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.what_you_learn.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0" />
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Students Enrolled</span>
                  <span className="font-medium">{course.enrollment_count.toLocaleString()}</span>
                </div>
                {course.duration_hours && (
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span className="font-medium">{course.duration_hours} hours</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Level</span>
                  <span className="font-medium capitalize">{course.level}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rating</span>
                  <span className="font-medium">{course.rating.toFixed(1)} ⭐</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}