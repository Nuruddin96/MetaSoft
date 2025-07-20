import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <AdminSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <div className="lg:pl-64">
        <AdminHeader onMenuToggle={toggleSidebar} />
        
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};