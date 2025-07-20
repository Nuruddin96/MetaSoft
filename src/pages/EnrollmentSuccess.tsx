import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, BookOpen, Play, Award } from "lucide-react";

export default function EnrollmentSuccess() {
  const [searchParams] = useSearchParams();
  const courseName = searchParams.get('course') || 'the course';

  useEffect(() => {
    // You can add analytics tracking here
    console.log('Enrollment successful');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader className="pb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-600">
              Enrollment Successful!
            </CardTitle>
            <CardDescription className="text-lg">
              You have successfully enrolled in {courseName}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-gradient-subtle rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">What's Next?</h3>
              <div className="grid md:grid-cols-3 gap-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Play className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Start Learning</h4>
                    <p className="text-sm text-muted-foreground">
                      Access your course materials immediately
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Track Progress</h4>
                    <p className="text-sm text-muted-foreground">
                      Monitor your learning journey
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Get Certificate</h4>
                    <p className="text-sm text-muted-foreground">
                      Earn certification upon completion
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-primary hover:opacity-90">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/courses">Browse More Courses</Link>
              </Button>
            </div>
            
            <div className="border-t pt-6">
              <p className="text-sm text-muted-foreground">
                Need help? <Link to="/support" className="text-primary hover:underline">Contact Support</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}