import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  Video,
  ChevronDown,
  ChevronRight,
  Monitor
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    badge: null
  },
  {
    title: "Website",
    icon: Globe,
    isDropdown: true,
    children: [
      {
        title: "Header Management",
        href: "/admin/header",
        icon: Monitor,
      },
      {
        title: "Pages",
        href: "/admin/pages",
        icon: FileText,
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
      },
      {
        title: "About Page",
        href: "/admin/about-page",
        icon: FileText,
      },
      {
        title: "Services",
        href: "/admin/services",
        icon: Settings,
      },
      {
        title: "Image Gallery",
        href: "/admin/image-gallery",
        icon: Layout,
      },
      {
        title: "Categories",
        href: "/admin/categories",
        icon: BookOpen,
      },
      {
        title: "Software Demos",
        href: "/admin/software-demos",
        icon: Monitor,
      },
      {
        title: "Support Tickets",
        href: "/admin/support-tickets",
        icon: Shield,
      },
      {
        title: "Landing Page",
        href: "/admin/landing-page",
        icon: FileText,
      },
    ]
  },
  {
    title: "User Management",
    icon: Users,
    isDropdown: true,
    children: [
      {
        title: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        title: "Enrollments",
        href: "/admin/enrollments",
        icon: GraduationCap,
      },
      {
        title: "Course Management",
        href: "/admin/courses",
        icon: BookOpen,
        badge: "12 pending"
      },
    ]
  },
  {
    title: "Payments",
    icon: CreditCard,
    isDropdown: true,
    badge: "3 refunds",
    children: [
      {
        title: "Payments",
        href: "/admin/payments",
        icon: CreditCard,
        badge: "3 refunds"
      },
      {
        title: "SSL Configuration",
        href: "/admin/ssl-config",
        icon: Shield,
      },
      {
        title: "bKash Configuration",
        href: "/admin/bkash-config",
        icon: CreditCard,
      },
    ]
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
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

  const toggleDropdown = (title: string) => {
    setOpenDropdowns(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isItemActive = (item: any) => {
    if (item.href) {
      return location.pathname === item.href;
    }
    if (item.children) {
      return item.children.some((child: any) => location.pathname === child.href);
    }
    return false;
  };

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
                const isActive = isItemActive(item);
                const isDropdownOpen = openDropdowns.includes(item.title);
                
                if (item.isDropdown) {
                  return (
                    <Collapsible
                      key={item.title}
                      open={isDropdownOpen}
                      onOpenChange={() => toggleDropdown(item.title)}
                    >
                      <CollapsibleTrigger asChild>
                        <button
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                            isActive 
                              ? "bg-accent text-accent-foreground" 
                              : "text-muted-foreground"
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <item.icon className="h-4 w-4" />
                            <span className="font-medium">{item.title}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {item.badge && (
                              <Badge variant="outline" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                            {isDropdownOpen ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 mt-1">
                        {item.children?.map((child: any) => {
                          const isChildActive = location.pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              to={child.href}
                              onClick={() => {
                                if (window.innerWidth < 1024) {
                                  onToggle();
                                }
                              }}
                              className={cn(
                                "flex items-center justify-between rounded-lg px-6 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground ml-3",
                                isChildActive 
                                  ? "bg-primary text-primary-foreground shadow-md" 
                                  : "text-muted-foreground"
                              )}
                            >
                              <div className="flex items-center space-x-3">
                                <child.icon className="h-4 w-4" />
                                <span className="font-medium">{child.title}</span>
                              </div>
                              {child.badge && (
                                <Badge 
                                  variant={isChildActive ? "secondary" : "outline"} 
                                  className="text-xs"
                                >
                                  {child.badge}
                                </Badge>
                              )}
                            </Link>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    to={item.href!}
                    onClick={() => {
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