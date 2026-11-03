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
  const { t, lang, formatCurrency, formatNumber } = useLanguage();
  const { error } = useToast();

  const [summary, setSummary] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, [startDate, endDate, lang]);

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
      error(lang === 'bn' ? 'হিসাব বিবরণী লোড করতে ব্যর্থ হয়েছে।' : 'Failed to load accounting summary.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">{t('loading')}</p>
      </div>
    );
  }

  const isNetProfitPositive = (summary?.net_profit || 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-indigo-600" />
            {lang === 'bn' ? 'হিসাবরক্ষণ ও লাভ-ক্ষতি বিবরণী' : 'Financials & Profit / Loss Statement'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'দোকানের মোট বিক্রয় আয়, পণ্য ক্রয়মূল্য (COGS), ব্যয় ও প্রকৃত নিট মুনাফা'
              : 'Realized gross margins, inventory COGS, operational overhead, and net profit'}
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
          <span className="text-xs text-slate-400">{lang === 'bn' ? 'হতে' : 'to'}</span>
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
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-100 opacity-90">
            {lang === 'bn' ? 'নির্বাচিত সময়কালের প্রকৃত নিট লাভ / ক্ষতি (Net Profit & Loss)' : 'Selected Period Realized Net Profit / Loss'}
          </span>
          <div className="text-4xl md:text-5xl font-black tracking-tight">
            {formatCurrency(summary?.net_profit)}
          </div>
          <p className="text-xs text-emerald-100/90">
            {lang === 'bn'
              ? `গ্রস প্রফিট ৳${Number(summary?.gross_profit).toLocaleString()} হতে মোট ব্যয় ৳${Number(summary?.total_expenses).toLocaleString()} বাদ দেওয়ার পর`
              : `Calculated as Gross Profit ৳${Number(summary?.gross_profit).toLocaleString()} minus total expenses ৳${Number(summary?.total_expenses).toLocaleString()}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/cash-flow"
            className="py-2.5 px-5 rounded-2xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition shadow-md"
          >
            {t('cashFlow')}
          </Link>
          <Link
            to="/reports"
            className="py-2.5 px-5 rounded-2xl bg-black/20 hover:bg-black/30 text-white font-bold text-xs backdrop-blur-md transition"
          >
            {t('reports')}
          </Link>
        </div>
      </div>

      {/* Core Breakdown KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">{lang === 'bn' ? 'মোট বিক্রয় রাজস্ব (Revenue)' : 'Total Sales Revenue'}</span>
            <DollarSign className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {formatCurrency(summary?.total_sales_revenue)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {lang === 'bn' ? 'গ্রাহকদের মোট বিলিং' : 'Gross customer checkout volume'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">{lang === 'bn' ? 'বিক্রিত পণ্যের কেনা দর (COGS)' : 'Cost of Goods Sold (COGS)'}</span>
            <Wallet className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {formatCurrency(summary?.total_cogs)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {lang === 'bn' ? 'ঐতিহাসিক ক্রয়মূল্য' : 'Cost of products invoiced'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">{lang === 'bn' ? 'মোট পরিচালন ব্যয় (Expenses)' : 'Operating Expenses'}</span>
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {formatCurrency(summary?.total_expenses)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {lang === 'bn' ? 'ভাড়া, বিল, বেতন ইত্যাদি' : 'Rent, utility, wages, logistics'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">{lang === 'bn' ? 'গ্রস মার্জিন (Gross Profit)' : 'Gross Profit Margin'}</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(summary?.gross_profit)}
          </div>
          <span className="text-[11px] text-emerald-500 mt-1 block font-semibold">
            {lang === 'bn' ? 'বিক্রয় হতে সরাসরি লাভ' : 'Revenue minus product COGS'}
          </span>
        </div>
      </div>

      {/* Due Ledger Cards: Customers & Suppliers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {lang === 'bn' ? 'গ্রাহকদের কাছে মোট বকেয়া (Receivable)' : 'Customer Receivables (Due)'}
              </h2>
            </div>
            <span className="text-lg font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(summary?.customer_due)}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'bn' ? 'বিভিন্ন বাকি বিক্রয় বাবদ গ্রাহকদের নিকট পাওনা মোট টাকার পরিমাণ।' : 'Outstanding amount owed by customers for credit sales.'}
          </p>
          <Link
            to="/customers"
            className="inline-block py-2 px-4 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition"
          >
            {lang === 'bn' ? 'বকেয়া গ্রাহক তালিকা দেখুন →' : 'View Customer Dues →'}
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {lang === 'bn' ? 'সরবরাহকারীদের দেনা (Payable)' : 'Supplier Payables (Due)'}
              </h2>
            </div>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">
              {formatCurrency(summary?.supplier_due)}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'bn' ? 'পাইকারি মালামাল ক্রয় বাবদ বিভিন্ন সরবরাহকারী প্রতিষ্ঠানের পাওনা টাকা।' : 'Outstanding payable to vendors and suppliers for stock purchases.'}
          </p>
          <Link
            to="/suppliers"
            className="inline-block py-2 px-4 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition"
          >
            {lang === 'bn' ? 'সরবরাহকারী দেনা তালিকা দেখুন →' : 'View Supplier Payables →'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccountingDashboard;
