import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';

export const AppLayout = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Strict Role Redirection & Guard
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const roleSlug = user?.role?.slug;
      const path = location.pathname;

      // Cashier is strictly restricted to POS, Sales, Customers, and Profile
      if (roleSlug === 'cashier') {
        const allowedPaths = ['/pos', '/sales', '/customers', '/profile'];
        const isAllowed = allowedPaths.some((p) => path.startsWith(p));
        if (!isAllowed) {
          navigate('/pos', { replace: true });
        }
      }

      // Store Manager cannot access Employees, Activity Logs, or System Settings
      if (roleSlug === 'manager' || roleSlug === 'store-manager') {
        if (
          path.startsWith('/employees') ||
          path.startsWith('/activity-logs') ||
          path.startsWith('/settings')
        ) {
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [loading, isAuthenticated, user, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500 tracking-wide">
            ISRAFIL BD SHOP...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 font-sans">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <TopNavbar isCollapsed={isCollapsed} />

      {/* Main Content Area */}
      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          isCollapsed ? 'pl-20' : 'pl-72'
        }`}
      >
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
