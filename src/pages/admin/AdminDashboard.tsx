import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

// Mock data for dashboard stats
const stats = [
  {
    title: "Total Students",
    value: "2,847",
    change: "+12.3%",
    icon: Users,
    color: "text-blue-600"
  },
  {
    title: "Active Courses",
    value: "156",
    change: "+8 new",
    icon: BookOpen,
    color: "text-green-600"
  },
  {
    title: "Monthly Revenue",
    value: "৳4,52,000",
    change: "+23.1%",
    icon: DollarSign,
    color: "text-purple-600"
  },
  {
    title: "Course Completions",
    value: "1,234",
    change: "+15.7%",
    icon: TrendingUp,
    color: "text-orange-600"
  }
];

const recentActivities = [
  {
    type: "course_upload",
    title: "New course uploaded",
    description: "Advanced React Patterns by Sabbir Hasan",
    time: "2 minutes ago",
    status: "pending"
  },
  {
    type: "payment",
    title: "Payment received",
    description: "৳2,500 from Rashida Khatun",
    time: "15 minutes ago",
    status: "completed"
  },
  {
    type: "refund",
    title: "Refund requested",
    description: "E-commerce Mastery course",
    time: "1 hour ago",
    status: "pending"
  },
  {
    type: "review",
    title: "5-star review received",
    description: "Digital Marketing Fundamentals",
    time: "2 hours ago",
    status: "completed"
  },
  {
    type: "enrollment",
    title: "New enrollment",
    description: "Facebook Marketing course",
    time: "3 hours ago",
    status: "completed"
  }
];

const topCourses = [
  {
    title: "Complete E-commerce Business Mastery 2024",
    instructor: "Rashid Ahmed",
    students: 2340,
    revenue: "৳58,50,000",
    rating: 4.9
  },
  {
    title: "Facebook & Instagram Marketing",
    instructor: "Fatima Khan",
    students: 1856,
    revenue: "৳33,40,800",
    rating: 4.8
  },
  {
    title: "Shopify Dropshipping Success",
    instructor: "Karim Rahman",
    students: 987,
    revenue: "৳31,58,400",
    rating: 4.9
  }
];

export default function AdminDashboard() {
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
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activities */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {activity.status === "completed" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : activity.status === "pending" ? (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <Badge 
                          variant={activity.status === "completed" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {activity.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Activities
              </Button>
            </CardContent>
          </Card>

          {/* Top Performing Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Top Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCourses.map((course, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-tight line-clamp-2">
                          {course.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          by {course.instructor}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{course.students.toLocaleString()} students</span>
                          <span>•</span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                            <span>{course.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      {course.revenue}
                    </div>
                    {index < topCourses.length - 1 && (
                      <div className="border-b border-border"></div>
                    )}
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