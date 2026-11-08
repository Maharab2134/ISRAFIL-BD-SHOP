import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShortcutProvider } from '../../context/ShortcutContext';
import { useSystemModules } from '../../context/SystemModuleContext';
import ErrorBoundary from '../common/ErrorBoundary';
import SectionMaintenanceScreen from '../common/SectionMaintenanceScreen';
import SuperAdminMaintenanceBanner from '../common/SuperAdminMaintenanceBanner';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';

export const AppLayout = () => {
  const { user, isAuthenticated, loading, hasPermission } = useAuth();
  const { getMaintenanceInfo } = useSystemModules();
  const location = useLocation();
  const navigate = useNavigate();
  const isPos = location.pathname.startsWith('/pos');
  const [isCollapsed, setIsCollapsed] = useState(() => window.location.pathname.startsWith('/pos'));

  const isSuperAdmin = user?.role?.slug === 'super-admin' || user?.email === 'admin@israfilbd.com';
  const { isUnderMaintenance, module: currentModule } = getMaintenanceInfo(location.pathname);

  // Automatically collapse sidebar on POS terminal to give maximum screen width for products
  useEffect(() => {
    if (location.pathname.startsWith('/pos')) {
      setIsCollapsed(true);
    }
  }, [location.pathname]);

  // Dynamic Role & Permission Route Guard
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const isSuperAdmin = user?.role?.slug === 'super-admin' || user?.email === 'admin@israfilbd.com';
      if (isSuperAdmin) return; // Super admin has unconditional access

      const path = location.pathname;

      const getFallbackRoute = () => {
        if (hasPermission('pos.access')) return '/pos';
        if (hasPermission('dashboard.view') || hasPermission('reports.view')) return '/dashboard';
        if (hasPermission('sales.view')) return '/sales';
        if (hasPermission('products.view')) return '/products';
        if (hasPermission('inventory.view')) return '/inventory';
        if (hasPermission('customers.view')) return '/customers';
        if (hasPermission('purchases.view')) return '/purchases';
        if (hasPermission('suppliers.view')) return '/suppliers';
        if (hasPermission('expenses.view')) return '/expenses';
        if (hasPermission('accounting.view')) return '/accounting';
        if (hasPermission('employees.view') || hasPermission('employees.manage')) return '/employees';
        if (hasPermission('audit.view')) return '/activity-logs';
        if (hasPermission('settings.manage') || hasPermission('settings.view')) return '/settings';
        return '/profile';
      };

      // Strict roles and audit logs check
      if (path.startsWith('/roles') && !hasPermission('employees.roles_manage')) {
        navigate(getFallbackRoute(), { replace: true });
        return;
      }
      if (path.startsWith('/activity-logs') && !hasPermission('audit.view')) {
        navigate(getFallbackRoute(), { replace: true });
        return;
      }

      // Permission-based route protection for Enterprise HR & Employees
      if (
        (path.startsWith('/employees') || path.startsWith('/organization-chart') || path.startsWith('/org-chart')) &&
        !hasPermission('employees.view') &&
        !hasPermission('employees.manage')
      ) {
        navigate(getFallbackRoute(), { replace: true });
        return;
      }
      if (
        path.startsWith('/departments') &&
        !hasPermission('departments.view') &&
        !hasPermission('employees.view') &&
        !hasPermission('employees.manage')
      ) {
        navigate(getFallbackRoute(), { replace: true });
        return;
      }
      if (
        path.startsWith('/designations') &&
        !hasPermission('designations.view') &&
        !hasPermission('employees.view') &&
        !hasPermission('employees.manage')
      ) {
        navigate(getFallbackRoute(), { replace: true });
        return;
      }
      if (
        path.startsWith('/attendance') &&
        !hasPermission('attendance.view') &&
        !hasPermission('employees.view') &&
        !hasPermission('employees.manage')
      ) {
        navigate(getFallbackRoute(), { replace: true });
        return;
      }
      if (path.startsWith('/settings') && !hasPermission('settings.manage') && !hasPermission('settings.view')) {
        navigate(getFallbackRoute(), { replace: true });
        return;
      }
      if ((path === '/' || path.startsWith('/dashboard')) && !hasPermission('dashboard.view') && !hasPermission('reports.view')) {
        navigate(getFallbackRoute(), { replace: true });
        return;
      }
      if (path.startsWith('/pos') && !hasPermission('pos.access')) {
        navigate(getFallbackRoute(), { replace: true });
        return;
      }
      if (path.startsWith('/products')) {
        if (!hasPermission('products.view')) {
          navigate(getFallbackRoute(), { replace: true });
          return;
        }
        if (path === '/products/new' && !hasPermission('products.create')) {
          navigate('/products', { replace: true });
          return;
        }
      }
      if (path.startsWith('/inventory')) {
        if (!hasPermission('inventory.view')) {
          navigate(getFallbackRoute(), { replace: true });
          return;
        }
        if (path === '/inventory/adjustment' && !hasPermission('inventory.adjust')) {
          navigate('/inventory', { replace: true });
          return;
        }
      }
      if (path.startsWith('/purchases')) {
        if (!hasPermission('purchases.view')) {
          navigate(getFallbackRoute(), { replace: true });
          return;
        }
        if (path === '/purchases/new' && !hasPermission('purchases.create')) {
          navigate('/purchases', { replace: true });
          return;
        }
      }
      if (path.startsWith('/sales') && !hasPermission('sales.view')) {
        navigate(getFallbackRoute(), { replace: true });
        return;
      }
      if (path.startsWith('/customers')) {
        if (!hasPermission('customers.view')) {
          navigate(getFallbackRoute(), { replace: true });
          return;
        }
        if (path === '/customers/new' && !hasPermission('customers.manage')) {
          navigate('/customers', { replace: true });
          return;
        }
      }
      if (path.startsWith('/suppliers') && !hasPermission('suppliers.view')) {
        navigate(getFallbackRoute(), { replace: true });
        return;
      }
      if (path.startsWith('/expenses')) {
        if (!hasPermission('expenses.view')) {
          navigate(getFallbackRoute(), { replace: true });
          return;
        }
        if (path === '/expenses/new' && !hasPermission('expenses.manage')) {
          navigate('/expenses', { replace: true });
          return;
        }
      }
      if (path.startsWith('/accounting') && !hasPermission('accounting.view')) {
        navigate(getFallbackRoute(), { replace: true });
        return;
      }
      if (path.startsWith('/reports') && !hasPermission('reports.view')) {
        navigate(getFallbackRoute(), { replace: true });
        return;
      }
    }
  }, [loading, isAuthenticated, user, location.pathname, navigate, hasPermission]);

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
    <ShortcutProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 font-sans print:bg-white print:text-black">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <TopNavbar isCollapsed={isCollapsed} />

        {/* Main Content Area */}
        <main
          className={`pt-16 min-h-screen transition-all duration-300 print:p-0 print:m-0 print:pt-0 print:pl-0 ${isCollapsed ? 'pl-20' : 'pl-72'
            }`}
        >
          <div className={isPos ? "p-1.5 sm:p-2.5 w-full print:p-0 print:m-0" : "p-3 sm:p-4 md:p-5 w-full print:p-0 print:m-0"}>
            {isUnderMaintenance && !isSuperAdmin ? (
              <SectionMaintenanceScreen module={currentModule} />
            ) : (
              <ErrorBoundary key={location.pathname} section={currentModule?.name_bn || currentModule?.name || location.pathname}>
                {isUnderMaintenance && isSuperAdmin && (
                  <SuperAdminMaintenanceBanner module={currentModule} />
                )}
                <Outlet />
              </ErrorBoundary>
            )}
          </div>
        </main>
      </div>
    </ShortcutProvider>
  );
};

export default AppLayout;
