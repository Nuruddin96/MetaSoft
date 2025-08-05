import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, BookOpen, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course_id');
  const tranId = searchParams.get('tran_id');
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (courseId && tranId) {
      fetchCourseDetails();
      // Small delay to ensure payment processing is complete
      setTimeout(() => {
        verifyPayment();
      }, 2000);
    }
  }, [courseId, tranId]);

  const fetchCourseDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('title, thumbnail_url')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      setCourse(data);
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  const verifyPayment = async () => {
    try {
      // First check if payment exists and get status
      const { data: payment, error } = await supabase
        .from('payments')
        .select('status, transaction_id')
        .eq('transaction_id', tranId)
        .single();

      if (error) throw error;

      // If payment is still pending, try to verify with bKash
      if (payment.status === 'pending') {
        try {
          const { data: verificationResult } = await supabase.functions.invoke('bkash-verify-payment', {
            body: { paymentID: payment.transaction_id }
          });

          if (verificationResult?.success) {
            toast({
              title: "Payment Verified!",
              description: "Your payment has been confirmed and enrollment is complete.",
            });
          }
        } catch (verifyError) {
          console.log('Verification attempt failed, payment may still be processing');
        }
      }

      if (payment.status === 'completed') {
        toast({
          title: "Payment Successful!",
          description: "Your enrollment has been confirmed.",
        });
      } else {
        toast({
          title: "Payment Processing",
          description: "Your payment is being processed. You'll receive confirmation shortly.",
        });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: "Verification Error",
        description: "Unable to verify payment status. Please contact support if you don't receive confirmation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your enrollment is being processed.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {course && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Course Enrolled:</h3>
              <div className="flex items-center space-x-3">
                {course.thumbnail_url && (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-12 h-8 object-cover rounded"
                  />
                )}
                <span className="font-medium">{course.title}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="font-semibold">What's Next?</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">Access Your Course</p>
                  <p className="text-sm text-muted-foreground">
                    Go to your dashboard to start learning immediately
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">Learn at Your Pace</p>
                  <p className="text-sm text-muted-foreground">
                    Enjoy lifetime access to all course materials
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium">Earn Your Certificate</p>
                  <p className="text-sm text-muted-foreground">
                    Complete the course to receive your certificate
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button asChild className="flex-1">
              <Link to="/dashboard">
                <BookOpen className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link to="/courses">
                Browse More Courses
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Need help? {" "}
              <Link to="/contact" className="text-primary hover:underline">
                Contact our support team
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}