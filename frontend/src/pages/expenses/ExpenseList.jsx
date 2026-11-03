import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  WalletCards,
  Plus,
  Search,
  Filter,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  FolderTree,
} from 'lucide-react';
import api from '../../services/api';

export const ExpenseList = () => {
  const { t, formatCurrency, formatNumber } = useLanguage();
  const { error } = useToast();

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/expense-categories');
        setCategories(res.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    fetchExpenses(pagination.current_page);
  }, [search, selectedCat, startDate, endDate]);

  const fetchExpenses = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/expenses', {
        params: {
          page,
          search: search || undefined,
          expense_category_id: selectedCat || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      });
      setExpenses(res.data.data || []);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      });
    } catch (e) {
      error('খরচের তালিকা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('expenseList')}
          </h1>
          <p className="text-sm text-slate-500">
            দোকান ভাড়া, বিদ্যুৎ, বেতন ও দৈনন্দিন পরিচালনা ব্যয়ের হিসাব
          </p>
        </div>

        <div className="flex items-center gap-3 self-start">
          <Link
            to="/expenses/categories"
            className="py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition"
          >
            <FolderTree className="w-4 h-4" />
            <span>খরচের খাত</span>
          </Link>
          <Link
            to="/expenses/new"
            className="py-2.5 px-4 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addExpense')}</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="খরচের নাম বা নম্বর দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
        >
          <option value="">সকল খরচের খাত</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name_bn || c.name}</option>
          ))}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
        />
      </div>

      {/* Expenses Table */}
      <div className="rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">ভাউচার নম্বর</th>
                <th className="p-4">তারিখ</th>
                <th className="p-4">খরচের খাত</th>
                <th className="p-4">বিবরণ / শিরোনাম</th>
                <th className="p-4">পেমেন্ট মাধ্যম</th>
                <th className="p-4 text-right">পরিমাণ (৳)</th>
                <th className="p-4">ইউজার</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">লোড হচ্ছে...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">কোনো খরচের রেকর্ড পাওয়া যায়নি।</td></tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">{exp.expense_number}</td>
                    <td className="p-4 text-slate-500 font-mono">{exp.expense_date}</td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {exp.category?.name_bn || exp.category?.name}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{exp.title}</td>
                    <td className="p-4 capitalize text-slate-600 dark:text-slate-300">{exp.payment_method}</td>
                    <td className="p-4 text-right font-black text-rose-600 text-sm">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="p-4 text-slate-500">{exp.user?.name || 'সিস্টেম'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            পৃষ্ঠা {formatNumber(pagination.current_page)} / {formatNumber(pagination.last_page)}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.current_page <= 1}
              onClick={() => fetchExpenses(pagination.current_page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchExpenses(pagination.current_page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

