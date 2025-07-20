import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from "lucide-react";

export default function PaymentFailed() {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course_id');
  const tranId = searchParams.get('tran_id');

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Payment Failed</CardTitle>
          <p className="text-muted-foreground">
            We couldn't process your payment. Please try again.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Transaction Details:</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Transaction ID:</span> {tranId}</p>
              <p><span className="font-medium">Status:</span> Failed</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">What can you do?</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <RefreshCw className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Try Again</p>
                  <p className="text-sm text-muted-foreground">
                    Go back to the course page and retry the payment
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <HelpCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Check Payment Method</p>
                  <p className="text-sm text-muted-foreground">
                    Ensure your payment method has sufficient funds
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {courseId && (
              <Button asChild className="flex-1">
                <Link to={`/checkout/${courseId}`}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild className="flex-1">
              <Link to="/courses">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Link>
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Still having issues? {" "}
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