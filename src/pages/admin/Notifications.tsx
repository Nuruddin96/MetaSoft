import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Bell, CheckCircle, AlertCircle, Clock, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  related_id?: string;
  related_type?: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    generateSystemNotifications();
  }, []);

  const fetchNotifications = async () => {
    // Since we don't have a notifications table yet, we'll generate them based on system events
    setLoading(false);
  };

  const generateSystemNotifications = async () => {
    try {
      // Generate notifications based on recent system activity
      const notifications: Notification[] = [];

      // Check for recent enrollments
      const { data: recentEnrollments } = await supabase
        .from('enrollments')
        .select('id, enrolled_at, course_id, student_id')
        .order('enrolled_at', { ascending: false })
        .limit(5);

      if (recentEnrollments) {
        for (const enrollment of recentEnrollments) {
          // Get course and student details separately
          const { data: course } = await supabase
            .from('courses')
            .select('title')
            .eq('id', enrollment.course_id)
            .single();
          
          const { data: student } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', enrollment.student_id)
            .single();

          notifications.push({
            id: `enrollment-${enrollment.id}`,
            title: 'New Enrollment',
            message: `${student?.full_name || 'A student'} enrolled in "${course?.title || 'a course'}"`,
            type: 'success',
            read: false,
            created_at: enrollment.enrolled_at,
            related_id: enrollment.id,
            related_type: 'enrollment'
          });
        }
      }

      // Check for recent payments
      const { data: recentPayments } = await supabase
        .from('payments')
        .select('id, amount, created_at, status, course_id')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentPayments) {
        for (const payment of recentPayments) {
          const { data: course } = await supabase
            .from('courses')
            .select('title')
            .eq('id', payment.course_id)
            .single();

          notifications.push({
            id: `payment-${payment.id}`,
            title: payment.status === 'completed' ? 'Payment Received' : 'Payment Issue',
            message: `Payment of ৳${payment.amount} for "${course?.title || 'a course'}" - Status: ${payment.status}`,
            type: payment.status === 'completed' ? 'success' : 'warning',
            read: false,
            created_at: payment.created_at,
            related_id: payment.id,
            related_type: 'payment'
          });
        }
      }

      // Check for new courses awaiting approval
      const { data: pendingCourses } = await supabase
        .from('courses')
        .select('id, title, created_at, instructor_id')
        .eq('is_published', false)
        .order('created_at', { ascending: false })
        .limit(3);

      if (pendingCourses) {
        for (const course of pendingCourses) {
          const { data: instructor } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', course.instructor_id)
            .single();

          notifications.push({
            id: `course-${course.id}`,
            title: 'Course Awaiting Review',
            message: `"${course.title}" by ${instructor?.full_name || 'Unknown'} needs approval`,
            type: 'info',
            read: false,
            created_at: course.created_at,
            related_id: course.id,
            related_type: 'course'
          });
        }
      }

      // Sort by created_at and take the most recent 20
      const sortedNotifications = notifications
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20);

      setNotifications(sortedNotifications);
    } catch (error) {
      console.error('Error generating notifications:', error);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    toast({
      title: "All notifications marked as read",
      description: "You're all caught up!",
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast({
      title: "Notification deleted",
      variant: "destructive",
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading notifications...</div>
        </div>
      </AdminLayout>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              Stay updated with platform activities and important events
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              Mark all as read
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 border rounded-lg transition-colors ${
                      !notification.read ? 'bg-muted/50 border-primary/20' : 'bg-background'
                    }`}
                  >
                    <div className="mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(notification.created_at)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <div className="flex gap-2 pt-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-7 text-xs"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-7 text-xs text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No notifications yet</p>
                <p className="text-sm text-muted-foreground">
                  You'll see updates about enrollments, payments, and course submissions here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}