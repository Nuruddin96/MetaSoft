import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Star
} from "lucide-react";

interface DashboardStats {
  totalStudents: number;
  activeCourses: number;
  totalRevenue: number;
  completionRate: number;
}

interface Course {
  id: string;
  title: string;
  instructor_name: string;
  enrollment_count: number;
  rating: number;
  total_revenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeCourses: 0,
    totalRevenue: 0,
    completionRate: 0
  });
  const [topCourses, setTopCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total students (unique profiles with student role)
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'student');

      if (studentsError) throw studentsError;

      // Fetch active courses (published courses)
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, enrollment_count, rating, price, profiles(full_name)')
        .eq('is_published', true);

      if (coursesError) throw coursesError;

      // Fetch total payments/revenue
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');

      if (paymentsError) throw paymentsError;

      // Fetch enrollment completion rate
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('id, status')
        .eq('status', 'active');

      if (enrollmentsError) throw enrollmentsError;

      // Calculate stats
      const totalRevenue = paymentsData?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
      const completedEnrollments = enrollmentsData?.filter(e => e.status === 'completed').length || 0;
      const totalEnrollments = enrollmentsData?.length || 0;
      const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

      setStats({
        totalStudents: studentsData?.length || 0,
        activeCourses: coursesData?.length || 0,
        totalRevenue,
        completionRate
      });

      // Set top courses (sorted by enrollment count)
      const sortedCourses = coursesData
        ?.sort((a, b) => b.enrollment_count - a.enrollment_count)
        .slice(0, 5)
        .map(course => ({
          id: course.id,
          title: course.title,
          instructor_name: course.profiles?.full_name || 'Unknown',
          enrollment_count: course.enrollment_count || 0,
          rating: Number(course.rating) || 0,
          total_revenue: (course.enrollment_count || 0) * Number(course.price || 0)
        })) || [];

      setTopCourses(sortedCourses);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  const statsConfig = [
    {
      title: "Total Students",
      value: stats.totalStudents.toLocaleString(),
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Active Courses",
      value: stats.activeCourses.toString(),
      icon: BookOpen,
      color: "text-green-600"
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "text-purple-600"
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with MetaSoft BD today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsConfig.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  Real-time data from database
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Top Performing Courses */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Top Performing Courses</CardTitle>
            </CardHeader>
            <CardContent>
              {topCourses.length > 0 ? (
                <div className="space-y-4">
                  {topCourses.map((course, index) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-tight">
                          {course.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          by {course.instructor_name}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{course.enrollment_count.toLocaleString()} students</span>
                          <span>•</span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                            <span>{course.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(course.total_revenue)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Revenue
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No course data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}