import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  Edit,
  Mail,
  Phone,
  Calendar,
  UserCheck
} from 'lucide-react';

export default function EmployeeList() {
  const { t, lang } = useLanguage();
  const { error } = useToast();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  const fetchEmployees = async (page = 1, searchQuery = search) => {
    setLoading(true);
    try {
      const res = await api.get('/employees', {
        params: { page, search: searchQuery },
      });
      setEmployees(res.data.data || []);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      });
    } catch (err) {
      error(lang === 'bn' ? 'কর্মী তালিকা লোড করতে সমস্যা হয়েছে।' : 'Failed to load employee list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(1);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees(1, search);
  };

  const getRoleBadge = (role) => {
    if (!role) return null;
    if (role.slug === 'super-admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
          <Shield className="w-3 h-3" />
          {role.name_bn || role.name}
        </span>
      );
    }
    if (role.slug === 'store-manager') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
          <Shield className="w-3 h-3" />
          {role.name_bn || role.name}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
        <UserCheck className="w-3 h-3" />
        {role.name_bn || role.name}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-600" />
            {t('employeeList')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'দোকানের ক্যাশিয়ার, ম্যানেজার ও কর্মচারীদের তালিকা ও ভূমিকা পরিচালনা'
              : 'Manage store staff, roles, system access, and credentials'}
          </p>
        </div>

        <Link
          to="/employees/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-sm w-fit"
        >
          <UserPlus className="w-4 h-4" />
          {t('addEmployee')}
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'bn' ? 'নাম, ইমেইল বা ফোন নম্বর দিয়ে খুঁজুন...' : 'Search by name, email, or phone...'}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
          {lang === 'bn' ? `মোট কর্মী: ${pagination.total} জন` : `Total Staff: ${pagination.total}`}
        </span>
      </div>

      {/* Employee Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">{t('loading')}</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('noData')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">{lang === 'bn' ? 'কর্মীর নাম' : 'Employee Name'}</th>
                  <th className="py-3.5 px-4">{lang === 'bn' ? 'যোগাযোগ' : 'Contact'}</th>
                  <th className="py-3.5 px-4">{lang === 'bn' ? 'পদবী / রোল' : 'Role'}</th>
                  <th className="py-3.5 px-4">{t('status')}</th>
                  <th className="py-3.5 px-4">{lang === 'bn' ? 'যুক্ত হওয়ার তারিখ' : 'Joined Date'}</th>
                  <th className="py-3.5 px-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0">
                          {emp.name ? emp.name[0].toUpperCase() : 'E'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {emp.name}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            ID: #{emp.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {emp.email}
                        </div>
                        {emp.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {emp.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getRoleBadge(emp.role)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {emp.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          <CheckCircle className="w-3 h-3" />
                          {t('active')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                          <XCircle className="w-3 h-3" />
                          {t('inactive')}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {emp.created_at ? new Date(emp.created_at).toLocaleDateString('bn-BD', { dateStyle: 'medium' }) : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/employees/edit/${emp.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 dark:hover:text-indigo-400 transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        {t('edit')}
                      </Link>
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
                onClick={() => fetchEmployees(pagination.current_page - 1)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {lang === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
              </button>
              <button
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => fetchEmployees(pagination.current_page + 1)}
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

