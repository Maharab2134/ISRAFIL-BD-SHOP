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
  const { t, lang, formatNumber } = useLanguage();
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
  }, [lang]);

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
            {lang === 'bn' ? 'লগইন' : 'Login'}
          </span>
        );
      case 'logout':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <LogOut className="w-3 h-3" />
            {lang === 'bn' ? 'লগআউট' : 'Logout'}
          </span>
        );
      case 'create':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
            <PlusCircle className="w-3 h-3" />
            {lang === 'bn' ? 'নতুন সংযোজন' : 'Create'}
          </span>
        );
      case 'update':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
            <Edit className="w-3 h-3" />
            {lang === 'bn' ? 'হালনাগাদ' : 'Update'}
          </span>
        );
      case 'delete':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
            <Trash2 className="w-3 h-3" />
            {lang === 'bn' ? 'মুছে ফেলা' : 'Delete'}
          </span>
        );
      case 'backup':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
            <Database className="w-3 h-3" />
            {lang === 'bn' ? 'ব্যাকআপ' : 'Backup'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Terminal className="w-3 h-3" />
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
              ? 'সিস্টেমের সকল ব্যবহারকারীর নিরাপত্তা ও কাজের ইতিহাস অডিট ট্রেইল'
              : 'Complete immutable audit trail of employee actions, transactions, and system events'}
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <form
        onSubmit={handleFilter}
        className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col sm:flex-row items-center gap-3"
      >
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">{lang === 'bn' ? 'সকল অ্যাকশন (All Actions)' : 'All Action Types'}</option>
            <option value="login">{lang === 'bn' ? 'লগইন (Login)' : 'Login'}</option>
            <option value="logout">{lang === 'bn' ? 'লগআউট (Logout)' : 'Logout'}</option>
            <option value="create">{lang === 'bn' ? 'নতুন সংযোজন (Create)' : 'Create'}</option>
            <option value="update">{lang === 'bn' ? 'হালনাগাদ (Update)' : 'Update'}</option>
            <option value="delete">{lang === 'bn' ? 'মুছে ফেলা (Delete)' : 'Delete'}</option>
            <option value="backup">{lang === 'bn' ? 'ডাটাবেস ব্যাকআপ (Backup)' : 'Database Backup'}</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="submit"
            className="flex-1 sm:flex-none py-2 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
          >
            {t('filter')}
          </button>
          {actionFilter && (
            <button
              type="button"
              onClick={handleReset}
              className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'রিসেট' : 'Reset'}</span>
            </button>
          )}
        </div>
      </form>

      {/* Logs Table */}
      <div className="rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">{lang === 'bn' ? 'সময় ও তারিখ' : 'Timestamp'}</th>
                <th className="p-4">{lang === 'bn' ? 'ব্যবহারকারী' : 'User'}</th>
                <th className="p-4">{lang === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                <th className="p-4">{lang === 'bn' ? 'বিবরণ' : 'Description'}</th>
                <th className="p-4">{lang === 'bn' ? 'আইপি ও মাধ্যম' : 'IP & Device'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    {t('loading')}
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4 font-mono text-slate-500 whitespace-nowrap">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">
                        {new Date(log.created_at).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                      </div>
                      <div className="text-[10px]">
                        {new Date(log.created_at).toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                      </div>
                    </td>

                    <td className="p-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-[10px]">
                          {log.user?.name ? log.user.name[0].toUpperCase() : 'S'}
                        </div>
                        <span>{log.user?.name || (lang === 'bn' ? 'সিস্টেম' : 'System')}</span>
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    <td className="p-4 text-slate-700 dark:text-slate-300">
                      <div>{log.description}</div>
                      {log.model_type && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {log.model_type.split('\\').pop()} #{log.model_id}
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      <div>{log.ip_address || '127.0.0.1'}</div>
                      <div className="text-[10px] truncate max-w-[140px] text-slate-400" title={log.user_agent}>
                        {log.user_agent ? (log.user_agent.includes('Chrome') ? 'Chrome' : 'Browser') : 'CLI'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            {lang === 'bn'
              ? `পৃষ্ঠা ${formatNumber(pagination.current_page)} / ${formatNumber(pagination.last_page)} (মোট ${formatNumber(pagination.total)})`
              : `Page ${formatNumber(pagination.current_page)} of ${formatNumber(pagination.last_page)} (Total ${formatNumber(pagination.total)})`}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.current_page <= 1}
              onClick={() => fetchLogs(pagination.current_page - 1)}
              className="py-1 px-3 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {lang === 'bn' ? 'আগের' : 'Prev'}
            </button>
            <button
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchLogs(pagination.current_page + 1)}
              className="py-1 px-3 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {lang === 'bn' ? 'পরের' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
