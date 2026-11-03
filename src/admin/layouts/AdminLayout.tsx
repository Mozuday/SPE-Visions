import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAdmin, loading } = useAuth();

  /*
   * Loading state — AuthContext is still resolving the session
   * and profile on initial mount.
   */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-cyan-500 dark:border-slate-700 dark:border-t-cyan-400" />

          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Verifying admin access...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Not logged in, or logged in but not an admin — redirect to login.
   */
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="min-h-[calc(100vh-64px)] p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;