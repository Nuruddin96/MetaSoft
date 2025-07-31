import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  Menu,
  X,
  LogOut,
  Shield,
  Globe,
  FileText,
  Building,
  Layout,
  Video
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    badge: null
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
    badge: null
  },
  {
    title: "Website",
    href: "/admin/website",
    icon: Globe,
    badge: null
  },
  {
    title: "Pages",
    href: "/admin/pages",
    icon: Building,
  },
  {
    title: "Homepage Content",
    href: "/admin/homepage-content",
    icon: Layout,
  },
  {
    title: "Videos",
    href: "/admin/videos",
    icon: Video,
  },
  {
    title: "Partners",
    href: "/admin/partners",
    icon: Building,
    badge: null
  },
  {
    title: "Course Management",
    href: "/admin/courses",
    icon: BookOpen,
    badge: "12 pending"
  },
  {
    title: "Enrollments",
    href: "/admin/enrollments",
    icon: GraduationCap,
    badge: null
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
    badge: "3 refunds"
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    badge: null
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    badge: "5 new"
  },
  {
    title: "SSL Configuration",
    href: "/admin/ssl-config",
    icon: Shield,
    badge: null
  },
  {
    title: "bKash Configuration",
    href: "/admin/bkash-config",
    icon: CreditCard,
    badge: null
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    badge: null
  }
];

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const AdminSidebar = ({ isOpen, onToggle }: AdminSidebarProps) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full bg-card border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "w-64"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Admin Panel</h2>
                <p className="text-sm text-muted-foreground">MetaSoft BD</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3">
            <nav className="space-y-2 py-4">
              {sidebarItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => {
                      // Close sidebar on mobile after navigation
                      if (window.innerWidth < 1024) {
                        onToggle();
                      }
                    }}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    {item.badge && (
                      <Badge 
                        variant={isActive ? "secondary" : "outline"} 
                        className="text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="mb-3">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">A</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-muted-foreground">admin@metasoftbd.com</p>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};