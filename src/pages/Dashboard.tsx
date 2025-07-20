import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Clock, Trophy, Play, User, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface EnrolledCourse {
  id: string;
  progress: number;
  enrolled_at: string;
  courses: {
    id: string;
    title: string;
    short_description?: string;
    thumbnail_url?: string;
    level: string;
    duration_hours?: number;
    course_categories?: {
      name: string;
    };
    profiles?: {
      full_name: string;
    };
  };
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    averageProgress: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchEnrolledCourses();
    }
  }, [user]);

  const fetchEnrolledCourses = async () => {
    if (!user) return;

    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Fetch enrolled courses
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          progress,
          enrolled_at,
          courses (
            id,
            title,
            short_description,
            thumbnail_url,
            level,
            duration_hours,
            course_categories (name),
            profiles (full_name)
          )
        `)
        .eq('student_id', profile.id)
        .eq('status', 'active')
        .order('enrolled_at', { ascending: false });

      if (error) throw error;

      const enrolledCourses = data as EnrolledCourse[];
      setEnrolledCourses(enrolledCourses);

      // Calculate stats
      const totalCourses = enrolledCourses.length;
      const completedCourses = enrolledCourses.filter(course => course.progress >= 100).length;
      const totalHours = enrolledCourses.reduce((sum, course) => sum + (course.courses.duration_hours || 0), 0);
      const averageProgress = totalCourses > 0 
        ? enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / totalCourses 
        : 0;

      setStats({
        totalCourses,
        completedCourses,
        totalHours,
        averageProgress
      });

    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      toast({
        title: "Error",
        description: "Failed to load your courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Required</CardTitle>
            <CardDescription>
              Please login to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-card rounded w-48" />
            <div className="grid md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-card rounded" />
              ))}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-card rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Continue your learning journey.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/courses">
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Courses
              </Link>
            </Button>
            <Button variant="outline" onClick={signOut}>
              <User className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                  <p className="text-2xl font-bold">{stats.totalCourses}</p>
                </div>
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedCourses}</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Learning Hours</p>
                  <p className="text-2xl font-bold">{stats.totalHours}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Progress</p>
                  <p className="text-2xl font-bold">{Math.round(stats.averageProgress)}%</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Courses */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Courses</h2>
            {enrolledCourses.length === 0 && (
              <Button asChild>
                <Link to="/courses">Enroll in Your First Course</Link>
              </Button>
            )}
          </div>

          {enrolledCourses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No courses enrolled yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start your learning journey by enrolling in a course
                </p>
                <Button asChild>
                  <Link to="/courses">Browse Courses</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((enrollment) => (
                <Card key={enrollment.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    {enrollment.courses.thumbnail_url ? (
                      <img
                        src={enrollment.courses.thumbnail_url}
                        alt={enrollment.courses.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-primary rounded-t-lg flex items-center justify-center">
                        <Play className="h-12 w-12 text-primary-foreground" />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {enrollment.courses.course_categories?.name || "General"}
                        </Badge>
                        <Badge variant="outline" className="capitalize text-xs">
                          {enrollment.courses.level}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold mb-2 line-clamp-2">
                        {enrollment.courses.title}
                      </h3>
                      
                      {enrollment.courses.short_description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {enrollment.courses.short_description}
                        </p>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{Math.round(enrollment.progress)}%</span>
                        </div>
                        
                        <Progress value={enrollment.progress} className="h-2" />
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{enrollment.courses.profiles?.full_name || "Unknown Instructor"}</span>
                          {enrollment.courses.duration_hours && (
                            <span>{enrollment.courses.duration_hours}h</span>
                          )}
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" asChild>
                          <Link to={`/learn/${enrollment.courses.id}`}>
                            {enrollment.progress > 0 ? "Continue" : "Start"} Learning
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}