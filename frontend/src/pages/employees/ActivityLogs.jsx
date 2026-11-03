import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import {
  Activity,
  Filter,
  RotateCcw,
  User,
  Shield,
  Clock,
  Terminal,
  Globe,
  LogIn,
  LogOut,
  Edit,
  PlusCircle,
  Trash2,
  Database
} from 'lucide-react';

export default function ActivityLogs() {
  const { t, lang } = useLanguage();
  const { error } = useToast();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  const fetchLogs = async (page = 1, action = actionFilter) => {
    setLoading(true);
    try {
      const params = { page };
      if (action) params.action = action;
      const res = await api.get('/activity-logs', { params });
      setLogs(res.data.data || []);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      });
    } catch (err) {
      error(lang === 'bn' ? 'অ্যাক্টিভিটি লগ লোড করতে ব্যর্থ হয়েছে।' : 'Failed to load activity logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchLogs(1, actionFilter);
  };

  const handleReset = () => {
    setActionFilter('');
    fetchLogs(1, '');
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'login':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            <LogIn className="w-3 h-3" />
            লগইন
          </span>
        );
      case 'logout':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <LogOut className="w-3 h-3" />
            লগআউট
          </span>
        );
      case 'create':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
            <PlusCircle className="w-3 h-3" />
            নতুন সংযোজন
          </span>
        );
      case 'update':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
            <Edit className="w-3 h-3" />
            হালনাগাদ
          </span>
        );
      case 'delete':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
            <Trash2 className="w-3 h-3" />
            মুছে ফেলা
          </span>
        );
      case 'stock_adjustment':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
            <Database className="w-3 h-3" />
            স্টক সমন্বয়
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Activity className="w-3 h-3" />
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-indigo-600" />
            {t('activityLogs')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'সিস্টেমে ইউজারদের প্রতিটি কাজের নিরাপদ অডিট ট্রেইল ও অ্যাকশন হিস্ট্রি'
              : 'Complete immutable system audit trail and operational action logs'}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <form onSubmit={handleFilter} className="flex items-center gap-3 flex-1 max-w-md">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">{lang === 'bn' ? 'সব অ্যাকশন' : 'All Actions'}</option>
            <option value="login">লগইন (Login)</option>
            <option value="logout">লগআউট (Logout)</option>
            <option value="create">নতুন তৈরি (Create)</option>
            <option value="update">আপডেট (Update)</option>
            <option value="delete">মুছে ফেলা (Delete)</option>
            <option value="stock_adjustment">স্টক সমন্বয় (Stock Adjustment)</option>
            <option value="password_change">পাসওয়ার্ড পরিবর্তন (Password Change)</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 shrink-0 shadow-sm"
          >
            <Filter className="w-4 h-4" />
            {t('filter')}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition shrink-0"
            title={t('reset')}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </form>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
          {lang === 'bn' ? `মোট রেকর্ড: ${pagination.total} টি` : `Total Logs: ${pagination.total}`}
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">{t('loading')}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('noData')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">{lang === 'bn' ? 'তারিখ ও সময়' : 'Timestamp'}</th>
                  <th className="py-3.5 px-4">{lang === 'bn' ? 'ব্যবহারকারী' : 'User'}</th>
                  <th className="py-3.5 px-4">{lang === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                  <th className="py-3.5 px-4">{lang === 'bn' ? 'বিবরণ' : 'Description'}</th>
                  <th className="py-3.5 px-4">{lang === 'bn' ? 'আইপি অ্যাড্রেস' : 'IP Address'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-xs text-slate-500 dark:text-slate-400">
                      {log.created_at ? new Date(log.created_at).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'medium' }) : '—'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {log.user?.name ? log.user.name[0].toUpperCase() : 'S'}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white text-xs">
                          {log.user?.name || 'সিস্টেম (System)'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-800 dark:text-slate-200">
                      {log.description}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-xs text-slate-500 dark:text-slate-400">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'bn'
                ? `পৃষ্ঠা ${pagination.current_page} এর ${pagination.last_page}`
                : `Page ${pagination.current_page} of ${pagination.last_page}`}
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.current_page <= 1}
                onClick={() => fetchLogs(pagination.current_page - 1)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {lang === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
              </button>
              <button
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => fetchLogs(pagination.current_page + 1)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {lang === 'bn' ? 'পরবর্তী' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
