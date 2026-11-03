import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Calendar,
  Filter,
  RotateCcw,
  Search,
  FileSpreadsheet,
  FileText,
  User,
  Tag
} from 'lucide-react';

export default function CashFlow() {
  const { t, formatCurrency, lang } = useLanguage();
  const { error } = useToast();

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ total_in: 0, total_out: 0, net_cash: 0 });
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  // Filters
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    start_date: '',
    end_date: '',
    page: 1,
  });

  const fetchCashFlow = async (appliedFilters = filters) => {
    setLoading(true);
    try {
      const params = {};
      if (appliedFilters.type) params.type = appliedFilters.type;
      if (appliedFilters.category) params.category = appliedFilters.category;
      if (appliedFilters.start_date) params.start_date = appliedFilters.start_date;
      if (appliedFilters.end_date) params.end_date = appliedFilters.end_date;
      params.page = appliedFilters.page;

      const res = await api.get('/accounting/cash-flow', { params });
      setTransactions(res.data.transactions.data || []);
      setSummary(res.data.summary || { total_in: 0, total_out: 0, net_cash: 0 });
      setPagination({
        current_page: res.data.transactions.current_page,
        last_page: res.data.transactions.last_page,
        total: res.data.transactions.total,
      });
    } catch (err) {
      error(lang === 'bn' ? 'ক্যাশ ফ্লো ডেটা লোড করতে সমস্যা হয়েছে।' : 'Failed to load cash flow data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashFlow();
  }, [filters.page]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
    fetchCashFlow({ ...filters, page: 1 });
  };

  const handleReset = () => {
    const resetState = {
      type: '',
      category: '',
      start_date: '',
      end_date: '',
      page: 1,
    };
    setFilters(resetState);
    fetchCashFlow(resetState);
  };

  const formatCategory = (cat) => {
    const mapping = {
      sale: lang === 'bn' ? 'পণ্য বিক্রয়' : 'Product Sale',
      customer_payment: lang === 'bn' ? 'গ্রাহক বকেয়া আদায়' : 'Customer Due Collection',
      supplier_payment: lang === 'bn' ? 'সরবরাহকারী পরিশোধ' : 'Supplier Payment',
      expense: lang === 'bn' ? 'দোকানের খরচ' : 'Shop Expense',
      purchase: lang === 'bn' ? 'পণ্য ক্রয়' : 'Purchase',
      opening_balance: lang === 'bn' ? 'প্রারম্ভিক ব্যালেন্স' : 'Opening Balance',
    };
    return mapping[cat] || cat;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-indigo-600" />
            {t('cashFlow')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'দোকানের ক্যাশ ড্রয়ার ও সমস্ত নগদ লেনদেনের সম্পূর্ণ হিসাব'
              : 'Complete cash ledger and real-time cash drawer tracking'}
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-emerald-100 dark:border-emerald-950/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {lang === 'bn' ? 'মোট নগদ জমা (ক্যাশ ইন)' : 'Total Cash In'}
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(summary.total_in)}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-rose-100 dark:border-rose-950/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {lang === 'bn' ? 'মোট নগদ খরচ (ক্যাশ আউট)' : 'Total Cash Out'}
            </span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {formatCurrency(summary.total_out)}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-indigo-100 dark:border-indigo-950/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {lang === 'bn' ? 'ক্যাশ ড্রয়ার স্থিতি (নিট নগদ)' : 'Net Cash in Drawer'}
            </span>
            <div className={`text-2xl font-black mt-1 ${summary.net_cash >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}`}>
              {formatCurrency(summary.net_cash)}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Controls Card */}
      <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              {lang === 'bn' ? 'লেনদেনের ধরন' : 'Type'}
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{lang === 'bn' ? 'সব ধরন' : 'All Types'}</option>
              <option value="in">{lang === 'bn' ? 'ক্যাশ ইন (+)' : 'Cash In (+)'}</option>
              <option value="out">{lang === 'bn' ? 'ক্যাশ আউট (-)' : 'Cash Out (-)'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              {lang === 'bn' ? 'খাত / ক্যাটাগরি' : 'Category'}
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{lang === 'bn' ? 'সব খাত' : 'All Categories'}</option>
              <option value="sale">{lang === 'bn' ? 'পণ্য বিক্রয়' : 'Product Sale'}</option>
              <option value="customer_payment">{lang === 'bn' ? 'গ্রাহক বকেয়া আদায়' : 'Customer Due'}</option>
              <option value="supplier_payment">{lang === 'bn' ? 'সরবরাহকারী পরিশোধ' : 'Supplier Payment'}</option>
              <option value="expense">{lang === 'bn' ? 'দোকানের খরচ' : 'Shop Expense'}</option>
              <option value="purchase">{lang === 'bn' ? 'পণ্য ক্রয়' : 'Purchase'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              {lang === 'bn' ? 'হতে' : 'From Date'}
            </label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              {lang === 'bn' ? 'পর্যন্ত' : 'To Date'}
            </label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Filter className="w-4 h-4" />
              {t('filter')}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition"
              title={t('reset')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Transactions Table Card */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'ক্যাশ লেনদেনের বিবরণ' : 'Cash Transactions Ledger'}
            </h2>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full">
              {pagination.total}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">{t('loading')}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('noData')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">{t('date')}</th>
                  <th className="py-3.5 px-4">{lang === 'bn' ? 'রেফারেন্স / ভাউচার' : 'Reference'}</th>
                  <th className="py-3.5 px-4">{lang === 'bn' ? 'ধরন' : 'Type'}</th>
                  <th className="py-3.5 px-4">{lang === 'bn' ? 'খাত' : 'Category'}</th>
                  <th className="py-3.5 px-4">{t('notes')}</th>
                  <th className="py-3.5 px-4">{lang === 'bn' ? 'কর্মী' : 'Staff'}</th>
                  <th className="py-3.5 px-4 text-right">{lang === 'bn' ? 'টাকার পরিমাণ' : 'Amount'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-xs whitespace-nowrap">
                      {tx.transaction_date ? new Date(tx.transaction_date).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {tx.reference_type ? `${tx.reference_type} #${tx.reference_id || ''}` : '—'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {tx.transaction_type === 'in' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          {lang === 'bn' ? 'জমা (+)' : 'In (+)'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          {lang === 'bn' ? 'খরচ (-)' : 'Out (-)'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {formatCategory(tx.category)}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-500 dark:text-slate-400">
                      {tx.description || '—'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                      {tx.user?.name || 'System'}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold font-mono whitespace-nowrap ${
                      tx.transaction_type === 'in'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {tx.transaction_type === 'in' ? '+' : '-'} {formatCurrency(tx.amount)}
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
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {lang === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
              </button>
              <button
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
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
