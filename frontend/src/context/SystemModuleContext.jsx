import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const SystemModuleContext = createContext();

export const SystemModuleProvider = ({ children }) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role?.slug === 'super-admin' || user?.email === 'admin@israfilbd.com';

  const [modules, setModules] = useState({});
  const [loadingModules, setLoadingModules] = useState(true);
  const [recentErrors, setRecentErrors] = useState([]);
  const [unreadErrorCount, setUnreadErrorCount] = useState(0);

  // Fetch module maintenance state
  const fetchModules = useCallback(async () => {
    try {
      const res = await api.get('/system/modules');
      if (res.data?.modules) {
        setModules(res.data.modules);
      }
      if (res.data?.recent_errors) {
        setRecentErrors(res.data.recent_errors);
      }
      if (typeof res.data?.unread_error_count === 'number') {
        setUnreadErrorCount(res.data.unread_error_count);
      }
    } catch (e) {
      // Quiet fail if network unavailable
    } finally {
      setLoadingModules(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
    // Refresh module maintenance states every 30 seconds
    const interval = setInterval(fetchModules, 30000);
    return () => clearInterval(interval);
  }, [fetchModules]);

  // Report client-side error to backend immediately
  const reportClientError = useCallback(
    async ({ section, errorMessage, errorStack, componentStack, url }) => {
      try {
        await api.post('/system/report-error', {
          section: section || 'General',
          error_message: errorMessage || 'Unknown Client Exception',
          error_stack: errorStack || '',
          component_stack: componentStack || '',
          url: url || window.location.href,
        });

        // Trigger local event for instant notification within current browser session
        window.dispatchEvent(
          new CustomEvent('israfil:system-error', {
            detail: { section, errorMessage, timestamp: new Date() },
          })
        );

        // Refresh error list for super-admin
        if (isSuperAdmin) {
          fetchModules();
        }
      } catch (e) {
        // Safe ignore network report failure to prevent cascading loops
      }
    },
    [isSuperAdmin, fetchModules]
  );

  // Global window unhandled error capture
  useEffect(() => {
    const handleGlobalError = (event) => {
      const msg = event.message || 'Script Error';
      // Ignore benign browser extension / ResizeObserver warnings
      if (
        msg.includes('ResizeObserver') ||
        msg.includes('Extension') ||
        msg.includes('Script error.')
      ) {
        return;
      }

      reportClientError({
        section: window.location.pathname,
        errorMessage: msg,
        errorStack: event.error?.stack || '',
        url: window.location.href,
      });
    };

    const handleRejection = (event) => {
      const reason = event.reason;
      const msg = typeof reason === 'string' ? reason : reason?.message || 'Unhandled Promise Rejection';
      if (msg.includes('ResizeObserver') || msg.includes('canceled')) return;

      reportClientError({
        section: window.location.pathname,
        errorMessage: msg,
        errorStack: reason?.stack || '',
        url: window.location.href,
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [reportClientError]);

  // Toggle module maintenance status (Super Admin only)
  const toggleModuleMaintenance = async (moduleId, isMaintenance, message, messageBn) => {
    try {
      const res = await api.post('/system/modules/toggle', {
        module_id: moduleId,
        is_maintenance: isMaintenance,
        message: message || undefined,
        message_bn: messageBn || undefined,
      });

      setModules((prev) => ({
        ...prev,
        [moduleId]: {
          ...prev[moduleId],
          is_maintenance: isMaintenance,
          message: message || prev[moduleId]?.message,
          message_bn: messageBn || prev[moduleId]?.message_bn,
          updated_at: new Date().toISOString(),
        },
      }));

      return { success: true, message: res.data.message };
    } catch (e) {
      return {
        success: false,
        message: e.response?.data?.message || 'মডিউল স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে।',
      };
    }
  };

  // Clear system errors
  const clearErrorLogs = async () => {
    try {
      const res = await api.post('/system/errors/clear');
      setRecentErrors([]);
      setUnreadErrorCount(0);
      return { success: true, message: res.data.message };
    } catch (e) {
      return {
        success: false,
        message: e.response?.data?.message || 'ত্রুটি ক্লিয়ার করতে ব্যর্থ হয়েছে।',
      };
    }
  };

  // Helper to match a URL pathname to a system module
  const getMaintenanceInfo = useCallback(
    (pathname) => {
      const path = pathname.toLowerCase();
      for (const [key, mod] of Object.entries(modules)) {
        if (mod.routes && mod.routes.some((r) => path === r || path.startsWith(r + '/'))) {
          return {
            isUnderMaintenance: Boolean(mod.is_maintenance),
            module: mod,
          };
        }
      }
      return { isUnderMaintenance: false, module: null };
    },
    [modules]
  );

  return (
    <SystemModuleContext.Provider
      value={{
        modules,
        loadingModules,
        fetchModules,
        toggleModuleMaintenance,
        getMaintenanceInfo,
        recentErrors,
        unreadErrorCount,
        clearErrorLogs,
        reportClientError,
      }}
    >
      {children}
    </SystemModuleContext.Provider>
  );
};

export const useSystemModules = () => {
  const context = useContext(SystemModuleContext);
  if (!context) {
    throw new Error('useSystemModules must be used within a SystemModuleProvider');
  }
  return context;
};
