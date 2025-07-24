import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AnalyticsData {
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  courseEnrollments: Array<{ course: string; enrollments: number }>;
  userGrowth: Array<{ month: string; users: number }>;
  topCourses: Array<{ title: string; revenue: number; enrollments: number }>;
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    monthlyRevenue: [],
    courseEnrollments: [],
    userGrowth: [],
    topCourses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch payments for revenue analytics
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, created_at, course_id')
        .eq('status', 'completed');

      // Fetch courses for enrollment analytics  
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, enrollment_count, price')
        .eq('is_published', true);

      // Fetch user registrations
      const { data: profiles } = await supabase
        .from('profiles')
        .select('created_at, role');

      // Process monthly revenue
      const monthlyRevenue = processMonthlyData(payments || [], 'amount') as Array<{ month: string; revenue: number }>;
      
      // Process user growth
      const userGrowth = processMonthlyData(profiles || [], 'count') as Array<{ month: string; users: number }>;

      // Top courses by revenue
      const topCourses = (courses || [])
        .map(course => ({
          title: course.title,
          revenue: (course.enrollment_count || 0) * Number(course.price || 0),
          enrollments: course.enrollment_count || 0
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Course enrollments
      const courseEnrollments = (courses || [])
        .slice(0, 8)
        .map(course => ({
          course: course.title.substring(0, 20) + (course.title.length > 20 ? '...' : ''),
          enrollments: course.enrollment_count || 0
        }));

      setAnalytics({
        monthlyRevenue,
        courseEnrollments,
        userGrowth,
        topCourses
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = (data: any[], field: string) => {
    const monthlyData: { [key: string]: number } = {};
    
    data.forEach(item => {
      const date = new Date(item.created_at);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (field === 'count') {
        monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
      } else {
        monthlyData[monthYear] = (monthlyData[monthYear] || 0) + Number(item[field] || 0);
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, value]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        [field === 'count' ? 'users' : 'revenue']: value
      }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading analytics...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed insights into your platform performance
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Monthly Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`৳${Number(value).toLocaleString()}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Course Enrollments Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Course Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.courseEnrollments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="course" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="enrollments" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Performing Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topCourses.map((course, index) => (
                  <div key={course.title} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {course.enrollments} enrollments
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        ৳{course.revenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}