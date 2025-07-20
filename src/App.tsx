import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Banner } from "@/components/Banner";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import CourseLearning from "./pages/CourseLearning";
import EnrollmentSuccess from "./pages/EnrollmentSuccess";
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import WebsiteManagement from "./pages/admin/WebsiteManagement";
import CourseManagement from "./pages/admin/CourseManagement";
import CourseDetailsManagement from "./pages/admin/CourseDetailsManagement";
import EnrollmentManagement from "./pages/admin/EnrollmentManagement";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {!isAdminPage && <Banner />}
      {!isAdminPage && <Header />}
      <main className="flex-1">
        <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/course/:id" element={<CourseDetails />} />
            <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/learn/:id" element={<CourseLearning />} />
            <Route path="/success" element={<EnrollmentSuccess />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/courses" 
              element={
                <ProtectedRoute requireAdmin>
                  <CourseManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/courses/:id" 
              element={
                <ProtectedRoute requireAdmin>
                  <CourseDetailsManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requireAdmin>
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/website" 
              element={
                <ProtectedRoute requireAdmin>
                  <WebsiteManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/enrollments" 
              element={
                <ProtectedRoute requireAdmin>
                  <EnrollmentManagement />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {!isAdminPage && <Footer />}
      </div>
    );
  };

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
