import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  Users,
  Truck,
  Calendar,
} from 'lucide-react';
import api from '../../services/api';

export const AccountingDashboard = () => {
  const { t, formatCurrency, formatNumber } = useLanguage();
  const { error } = useToast();

  const [summary, setSummary] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, [startDate, endDate]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounting/summary', {
        params: {
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      });
      setSummary(res.data);
    } catch (e) {
      error('হিসাব বিবরণী লোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">হিসাব তথ্য লোড হচ্ছে...</div>;
  }

  const isNetProfitPositive = (summary?.net_profit || 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('accounting')} ও লাভ-ক্ষতি বিবরণী
          </h1>
          <p className="text-sm text-slate-500">
            দোকানের মোট আয়, ব্যয়, পণ্য ক্রয়মূল্য (COGS) ও প্রকৃত নিট মুনাফা
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 self-start">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
          />
          <span className="text-xs text-slate-400">হতে</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
          />
        </div>
      </div>

      {/* Top Net Profit Highlight Banner */}
      <div className={`p-8 rounded-3xl border shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 ${
        isNetProfitPositive
          ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-500'
          : 'bg-gradient-to-r from-rose-600 to-red-700 text-white border-rose-500'
      }`}>
        <div className="space-y-1 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-100">
            নির্বাচিত সময়কালের প্রকৃত নিট লাভ / ক্ষতি (Net Profit & Loss)
          </span>
          <div className="text-4xl md:text-5xl font-black tracking-tight">
            {formatCurrency(summary?.net_profit)}
          </div>
          <p className="text-xs text-emerald-100/80">
            গ্রস প্রফিট ৳{Number(summary?.gross_profit).toLocaleString()} হতে মোট পরিচালন ব্যয় ৳{Number(summary?.total_expenses).toLocaleString()} বাদ দেওয়ার পর
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/reports"
            className="py-3 px-6 rounded-2xl font-bold text-xs bg-white text-emerald-800 hover:bg-emerald-50 shadow-md transition"
          >
            পূর্ণাঙ্গ আর্থিক রিপোর্ট দেখুন
          </Link>
        </div>
      </div>

      {/* Financial Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-400 block">মোট বিক্রয় মূল্য (Gross Sales)</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(summary?.gross_sales)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">ছাড়ের পূর্বে তালিকাভুক্ত মূল্য</span>
        </div>

        {/* Total COGS */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-400 block">বিক্রিত পণ্যের ক্রয়মূল্য (COGS)</span>
          <div className="text-xl font-black text-amber-600 mt-1">
            {formatCurrency(summary?.total_cogs)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">বিক্রিত মালের কেনা খরচ</span>
        </div>

        {/* Gross Profit */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-400 block">মোট মোট লাভ (Gross Profit)</span>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {formatCurrency(summary?.gross_profit)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">নিট বিক্রয় - পণ্যের ক্রয়মূল্য</span>
        </div>

        {/* Operating Expenses */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-400 block">মোট পরিচালন ব্যয় (Expenses)</span>
          <div className="text-xl font-black text-rose-600 mt-1">
            {formatCurrency(summary?.total_expenses)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">ভাড়া, বিদ্যুৎ, স্টাফ বেতন ইত্যাদি</span>
        </div>
      </div>

      {/* Receivables & Payables Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Due (Receivable) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>মোট গ্রাহক বাকি (Customer Due)</span>
            </div>
            <div className="text-2xl font-black text-rose-600 mt-2">
              {formatCurrency(summary?.total_customer_due)}
            </div>
            <p className="text-xs text-slate-400 mt-1">দোকানের পাওনা বকেয়া টাকা</p>
          </div>
          <Link
            to="/customers?has_due=1"
            className="py-2 px-4 rounded-xl font-bold text-xs bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition"
          >
            বকেয়া তালিকা
          </Link>
        </div>

        {/* Supplier Due (Payable) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
              <Truck className="w-4 h-4" />
              <span>সরবরাহকারী দেনা (Supplier Payable)</span>
            </div>
            <div className="text-2xl font-black text-amber-600 mt-2">
              {formatCurrency(summary?.total_supplier_due)}
            </div>
            <p className="text-xs text-slate-400 mt-1">দোকানের পক্ষ থেকে পরিশোধযোগ্য দেনা</p>
          </div>
          <Link
            to="/suppliers"
            className="py-2 px-4 rounded-xl font-bold text-xs bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition"
          >
            সাপ্লায়ার দেনা
          </Link>
        </div>
      </div>
    </div>
  );
};
