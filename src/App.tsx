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
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import WebsiteManagement from "./pages/admin/WebsiteManagement";
import CourseManagement from "./pages/admin/CourseManagement";
import CourseDetailsManagement from "./pages/admin/CourseDetailsManagement";
import EnrollmentManagement from "./pages/admin/EnrollmentManagement";
import PageManagement from "./pages/admin/PageManagement";
import Analytics from "./pages/admin/Analytics";
import Notifications from "./pages/admin/Notifications";
import SSLConfigManagement from "./pages/admin/SSLConfigManagement";
import BkashConfigManagement from "./pages/admin/BkashConfigManagement";
import HeroBannerManagement from "./pages/admin/HeroBannerManagement";
import CustomPage from "./pages/CustomPage";
import Categories from "./pages/Categories";
import About from "./pages/About";
import HomepageContentManagement from "./pages/admin/HomepageContentManagement";
import VideoManagement from "./pages/admin/VideoManagement";
import PartnersManagement from "./pages/admin/PartnersManagement";
import AboutPageManagement from "./pages/admin/AboutPageManagement";
import HeaderManagement from "./pages/admin/HeaderManagement";
import ServicesManagement from "./pages/admin/ServicesManagement";
import { ImageGalleryManagement } from "./pages/admin/ImageGalleryManagement";
import { ServiceDetail } from "./pages/ServiceDetail";
import { ResetPassword } from "./pages/ResetPassword";

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
            <Route path="/categories" element={<Categories />} />
            <Route path="/about" element={<About />} />
            <Route path="/course/:id" element={<CourseDetails />} />
            <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/learn/:id" element={<CourseLearning />} />
            <Route path="/success" element={<EnrollmentSuccess />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />
            <Route path="/payment/cancelled" element={<PaymentFailed />} />
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
            <Route 
              path="/admin/pages" 
              element={
                <ProtectedRoute requireAdmin>
                  <PageManagement />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute requireAdmin>
                  <WebsiteManagement />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/analytics" 
              element={
                <ProtectedRoute requireAdmin>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/notifications" 
              element={
                <ProtectedRoute requireAdmin>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/hero-banners" 
              element={
                <ProtectedRoute requireAdmin>
                  <HeroBannerManagement />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/ssl-config" 
              element={
                <ProtectedRoute requireAdmin>
                  <SSLConfigManagement />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/bkash-config" 
              element={
                <ProtectedRoute requireAdmin>
                  <BkashConfigManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/homepage-content" 
              element={
                <ProtectedRoute requireAdmin>
                  <HomepageContentManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/videos" 
              element={
                <ProtectedRoute requireAdmin>
                  <VideoManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/partners" 
              element={
                <ProtectedRoute requireAdmin>
                  <PartnersManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/about-page" 
              element={
                <ProtectedRoute requireAdmin>
                  <AboutPageManagement />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/header" 
              element={
                <ProtectedRoute requireAdmin>
                  <HeaderManagement />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/services" 
              element={
                <ProtectedRoute requireAdmin>
                  <ServicesManagement />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/image-gallery" 
              element={
                <ProtectedRoute requireAdmin>
                  <ImageGalleryManagement />
                </ProtectedRoute>
              }
            />
            <Route path="/service/:id" element={<ServiceDetail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/admin/payments" 
              element={
                <ProtectedRoute requireAdmin>
                  <EnrollmentManagement />
                </ProtectedRoute>
              }
            />
            {/* Custom pages route - must be at the end before catch-all */}
            <Route path="/:slug" element={<CustomPage />} />
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
