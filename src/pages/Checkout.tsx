import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Clock, Users, BookOpen, ArrowLeft, CreditCard, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchCourse();
      if (user) {
        checkEnrollment();
      }
    }
  }, [id, user]);

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
          level,
          what_you_learn,
          requirements,
          course_categories (name),
          profiles (full_name, bio, avatar_url)
        `)
        .eq('id', id)
        .eq('is_published', true)
        .maybeSingle();

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

  const checkEnrollment = async () => {
    if (!user || !id) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const { data } = await supabase
          .from('enrollments')
          .select('id')
          .eq('course_id', id)
          .eq('student_id', profile.id)
          .eq('status', 'active')
          .maybeSingle();

        setAlreadyEnrolled(!!data);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleEnrollment = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to enroll in this course",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!course) return;

    setEnrolling(true);

    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile) {
        throw new Error('User profile not found');
      }

      const finalPrice = course.discounted_price || course.price;

      // Check if course is free
      if (finalPrice === 0) {
        // Free course - direct enrollment
        const { error: enrollmentError } = await supabase
          .from('enrollments')
          .insert({
            course_id: id,
            student_id: profile.id,
            status: 'active',
            progress: 0
          });

        if (enrollmentError) throw enrollmentError;

        // Create payment record for free enrollment
        await supabase
          .from('payments')
          .insert({
            user_id: profile.id,
            course_id: id,
            amount: 0,
            status: 'completed',
            payment_method: 'free',
            currency: 'BDT',
            payment_date: new Date().toISOString()
          });

        toast({
          title: "Enrollment Successful!",
          description: "You have been successfully enrolled in this course",
        });

        navigate(`/success?course=${encodeURIComponent(course.title)}`);
      } else {
        // Paid course - process SSLCommerz payment
        console.log('Attempting to create payment session for course:', course.id, 'amount:', finalPrice);
        
        const { data, error } = await supabase.functions.invoke('sslcommerz-payment', {
          body: {
            courseId: course.id,
            amount: finalPrice,
            currency: 'BDT'
          }
        });

        console.log('Payment function response:', { data, error });

        if (error) {
          console.error('Function invocation error:', error);
          throw new Error(`Function error: ${error.message}`);
        }

        if (!data?.success) {
          console.error('Payment initialization failed:', data);
          throw new Error(data?.error || 'Payment initialization failed');
        }

        // Redirect to SSLCommerz payment page
        console.log('Redirecting to payment URL:', data.payment_url);
        window.location.href = data.payment_url;
      }
    } catch (error: any) {
      console.error('Error enrolling:', error);
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to enroll in the course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-card rounded w-32" />
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

  const finalPrice = course.discounted_price || course.price;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to={`/course/${course.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Link>
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Course Details */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {course.course_categories?.name || "General"}
                    </Badge>
                    <CardTitle className="text-2xl mb-2">{course.title}</CardTitle>
                    <CardDescription className="text-base">
                      {course.short_description}
                    </CardDescription>
                  </div>
                  {course.thumbnail_url && (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-24 h-16 object-cover rounded-lg"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Course Stats */}
                <div className="flex flex-wrap gap-6">
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

                <Separator />

                {/* Instructor */}
                {course.profiles && (
                  <div>
                    <h3 className="font-semibold mb-2">Instructor</h3>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{course.profiles.full_name}</p>
                        <p className="text-sm text-muted-foreground">Course Instructor</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* What You'll Learn */}
                {course.what_you_learn && course.what_you_learn.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">What You'll Learn</h3>
                    <ul className="space-y-2">
                      {course.what_you_learn.slice(0, 5).map((item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Checkout Card */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Complete Enrollment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price */}
                <div className="text-center">
                  {course.discounted_price ? (
                    <>
                      <div className="text-3xl font-bold text-primary mb-1">
                        ৳{course.discounted_price.toLocaleString()}
                      </div>
                      <div className="text-lg text-muted-foreground line-through">
                        ৳{course.price.toLocaleString()}
                      </div>
                      <Badge variant="destructive" className="mt-2">
                        Save ৳{(course.price - course.discounted_price).toLocaleString()}
                      </Badge>
                    </>
                  ) : (
                    <div className="text-3xl font-bold text-primary">
                      ৳{course.price.toLocaleString()}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Order Summary */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Order Summary</h4>
                  <div className="flex justify-between">
                    <span>Course Price</span>
                    <span>৳{course.price.toLocaleString()}</span>
                  </div>
                  {course.discounted_price && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-৳{(course.price - course.discounted_price).toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>৳{finalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <Separator />

                {/* Enrollment Button */}
                {alreadyEnrolled ? (
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-4">
                      Already Enrolled
                    </Badge>
                    <Button asChild className="w-full">
                      <Link to="/dashboard">Go to Dashboard</Link>
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={handleEnrollment}
                    disabled={enrolling}
                    size="lg" 
                    className="w-full bg-gradient-primary hover:opacity-90"
                  >
                    {enrolling ? "Processing..." : "Enroll Now"}
                  </Button>
                )}

                {/* Security Badge */}
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Secure enrollment process</span>
                </div>

                {/* Features */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                    <span>Lifetime access</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                    <span>30-day money-back guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}