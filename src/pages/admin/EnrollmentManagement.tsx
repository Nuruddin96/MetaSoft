import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  Search, 
  Filter,
  Calendar,
  Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Enrollment {
  id: string;
  enrolled_at: string;
  progress: number;
  status: string;
  profiles: {
    full_name: string;
    email: string;
  };
  courses: {
    id: string;
    title: string;
    price: number;
    discounted_price?: number;
  };
  payments?: {
    amount: number;
    status: string;
    payment_method: string;
    payment_date: string;
  }[];
}

interface Stats {
  totalEnrollments: number;
  activeStudents: number;
  totalRevenue: number;
  completionRate: number;
}

export default function EnrollmentManagement() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalEnrollments: 0,
    activeStudents: 0,
    totalRevenue: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchEnrollments();
  }, []);

  useEffect(() => {
    filterEnrollments();
  }, [enrollments, searchTerm, statusFilter, dateFilter]);

  const fetchEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          enrolled_at,
          progress,
          status,
          profiles!enrollments_student_id_fkey (
            full_name,
            email
          ),
          courses (
            id,
            title,
            price,
            discounted_price
          )
        `)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;

      // Fetch payments separately
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*');

      const enrollmentData = (data || []).map(enrollment => ({
        ...enrollment,
        payments: paymentsData?.filter(payment => 
          payment.course_id === enrollment.courses?.id
        ) || []
      }));

      setEnrollments(enrollmentData as Enrollment[]);

      // Calculate stats
      const totalEnrollments = enrollmentData.length;
      const activeStudents = new Set(enrollmentData.filter(e => e.status === 'active').map(e => e.profiles.email)).size;
      const totalRevenue = enrollmentData.reduce((sum, enrollment) => {
        const payments = enrollment.payments || [];
        return sum + payments.reduce((paymentSum, payment) => 
          payment.status === 'completed' ? paymentSum + payment.amount : paymentSum, 0
        );
      }, 0);
      const completedEnrollments = enrollmentData.filter(e => e.progress >= 100).length;
      const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

      setStats({
        totalEnrollments,
        activeStudents,
        totalRevenue,
        completionRate
      });

    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast({
        title: "Error",
        description: "Failed to load enrollment data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEnrollments = () => {
    let filtered = enrollments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(enrollment =>
        enrollment.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.courses.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(enrollment => enrollment.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      if (dateFilter !== "all") {
        filtered = filtered.filter(enrollment => 
          new Date(enrollment.enrolled_at) >= filterDate
        );
      }
    }

    setFilteredEnrollments(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-card rounded w-64 mb-6" />
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-card rounded" />
              ))}
            </div>
            <div className="h-96 bg-card rounded" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Enrollment Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage student enrollments and payments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
              <p className="text-xs text-muted-foreground">
                Active learning sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeStudents}</div>
              <p className="text-xs text-muted-foreground">
                Unique learners
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From course sales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Course completion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Records</CardTitle>
            <CardDescription>
              View and manage all student enrollments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students, courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Enrolled Date</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Payment Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.map((enrollment) => {
                    const payment = enrollment.payments?.[0];
                    const revenue = enrollment.courses.discounted_price || enrollment.courses.price;
                    
                    return (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{enrollment.profiles.full_name}</div>
                            <div className="text-sm text-muted-foreground">{enrollment.profiles.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{enrollment.courses.title}</div>
                        </TableCell>
                        <TableCell>{formatDate(enrollment.enrolled_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${enrollment.progress}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{Math.round(enrollment.progress)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(enrollment.status)}>
                            {enrollment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>৳{revenue.toLocaleString()}</TableCell>
                        <TableCell>
                          {payment ? (
                            <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                              {payment.status}
                            </Badge>
                          ) : (
                            <Badge variant="outline">No Payment</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredEnrollments.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No enrollments found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}