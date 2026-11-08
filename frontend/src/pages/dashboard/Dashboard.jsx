import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  CreditCard,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  ChevronRight,
  ShoppingCart,
  Plus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../../services/api';

const PAYMENT_COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EC4899'];

export const Dashboard = () => {
  const { t, lang, formatCurrency, formatNumber } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [lang]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const bestSelling = data?.best_selling || [];
  const recentSales = data?.recent_sales || [];
  const lowStockAlerts = data?.low_stock_alerts || [];

  const paymentBreakdownData = (charts.payment_breakdown || [])
    .map((p) => {
      const rawAmt = Number(p.total_amount) || 0;
      const method = (p.payment_method || 'other').trim();
      let displayName = method.charAt(0).toUpperCase() + method.slice(1);
      if (method.toLowerCase() === 'bkash') displayName = 'bKash';
      if (method.toLowerCase() === 'nagad') displayName = 'Nagad';

      return {
        ...p,
        payment_method: method,
        name: displayName,
        total_amount: rawAmt,
      };
    })
    .filter((p) => p.total_amount > 0);

  const totalPaymentAmount = paymentBreakdownData.reduce((acc, curr) => acc + curr.total_amount, 0);

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('dashboard')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {lang === 'bn'
              ? 'দোকানের দৈনিক বিক্রয়, ইনভেন্টরি ও লাভ-ক্ষতির রিয়েলটাইম সারসংক্ষেপ'
              : 'Real-time overview of daily sales, inventory, and gross profit'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/pos"
            className="px-4 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2 transition"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন পিওএস বিক্রয়' : 'New POS Sale'}</span>
          </Link>
          <Link
            to="/products/new"
            className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'পণ্য যুক্ত করুন' : 'Add Product'}</span>
          </Link>
        </div>
      </div>

      {/* 6 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Today's Sales */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">{t('todaySales')}</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {formatCurrency(kpis.today_sales)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>
                {formatNumber(kpis.sales_change_percent)}% {lang === 'bn' ? 'গতকালের তুলনায়' : 'vs yesterday'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">{t('totalOrders')}</span>
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {formatNumber(kpis.today_orders)} {lang === 'bn' ? 'টি' : 'orders'}
            </div>
            <div className="mt-1 text-[11px] text-slate-400 font-medium">
              {lang === 'bn' ? 'আজকের সম্পন্ন চালান' : 'Completed invoices today'}
            </div>
          </div>
        </div>

        {/* Card 3: Today's Profit */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">{t('todayProfit')}</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(kpis.today_profit)}
            </div>
            <div className="mt-1 text-[11px] text-slate-400 font-medium">
              {lang === 'bn' ? 'বিক্রয় লাভ (COGS বাদে)' : 'Gross Profit (excl. COGS)'}
            </div>
          </div>
        </div>

        {/* Card 4: Today's Expenses */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">{t('todayExpenses')}</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(kpis.today_expenses)}
            </div>
            <div className="mt-1 text-[11px] text-slate-400 font-medium">
              {lang === 'bn' ? 'দোকানের পরিচালন ব্যয়' : 'Operating store expenses'}
            </div>
          </div>
        </div>

        {/* Card 5: Total Products */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">{t('totalProducts')}</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {formatNumber(kpis.total_products)} {lang === 'bn' ? 'প্রকার' : 'items'}
            </div>
            <div className="mt-1 text-[11px] text-slate-400 font-medium">
              {lang === 'bn' ? 'সক্রিয় পণ্যের আইটেম' : 'Active catalog items'}
            </div>
          </div>
        </div>

        {/* Card 6: Low Stock Alerts */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">{t('lowStock')}</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-rose-600">
              {formatNumber(kpis.low_stock_count)} {lang === 'bn' ? 'টি' : 'alerts'}
            </div>
            <div className="mt-1 text-[11px] text-rose-500 font-medium">
              {lang === 'bn' ? 'অবিলম্বে রি-অর্ডার প্রয়োজন' : 'Immediate reorder needed'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Profit Trends Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {lang === 'bn' ? 'বিক্রয় ও লাভের প্রবণতা (বিগত ১৪ দিন)' : 'Sales & Profit Trends (Last 14 Days)'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'bn' ? 'প্রতিদিনের অর্জিত রাজস্ব ও মোট নিট মুনাফা' : 'Daily gross revenue and net profit performance'}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-xs" />
                <span className="text-indigo-950 dark:text-indigo-200">
                  {lang === 'bn' ? 'মোট বিক্রয়' : 'Sales'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                <span className="text-emerald-950 dark:text-emerald-200">
                  {lang === 'bn' ? 'লাভ' : 'Profit'}
                </span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.daily_trends || []} margin={{ top: 10, right: 15, left: 15, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#E2E8F0'} opacity={0.7} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: isDark ? '#CBD5E1' : '#1E293B', fontWeight: 600 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={68}
                  tick={{ fontSize: 11, fill: isDark ? '#CBD5E1' : '#1E293B', fontWeight: 700 }}
                  tickFormatter={(val) => `৳${Number(val).toLocaleString()}`}
                />
                <Tooltip
                  formatter={(val, name) => [
                    formatCurrency(val),
                    name === 'sales' ? (lang === 'bn' ? 'মোট বিক্রয়' : 'Total Sales') : (lang === 'bn' ? 'মোট লাভ' : 'Net Profit')
                  ]}
                  contentStyle={{
                    backgroundColor: isDark ? '#0F172A' : '#1E293B',
                    borderRadius: '12px',
                    border: '1px solid ' + (isDark ? '#334155' : '#475569'),
                    color: '#F8FAFC',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.25)',
                  }}
                  itemStyle={{ fontWeight: 'bold' }}
                  labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" name="sales" />
                <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#profitGrad)" name="profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Breakdown Chart (1 col) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'পেমেন্ট মাধ্যম বিশ্লেষণ' : 'Payment Methods Breakdown'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'bn' ? 'চলতি মাসের লেনদেন অনুপাত' : 'Current month transaction distribution'}
            </p>
          </div>

          {paymentBreakdownData.length === 0 ? (
            <div className="h-52 my-auto flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <CreditCard className="w-10 h-10 mb-2 stroke-[1.5] text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-medium">
                {lang === 'bn' ? 'চলতি মাসে কোনো লেনদেন নেই' : 'No transactions this month'}
              </p>
            </div>
          ) : (
            <div className="relative h-52 my-auto w-full min-h-[200px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height={210} minHeight={200}>
                <PieChart>
                  <Pie
                    data={paymentBreakdownData}
                    dataKey="total_amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={paymentBreakdownData.length > 1 ? 4 : 0}
                    isAnimationActive={false}
                  >
                    {paymentBreakdownData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [
                      formatCurrency(val),
                      name || (lang === 'bn' ? 'মোট টাকা' : 'Total Amount')
                    ]}
                    contentStyle={{
                      backgroundColor: isDark ? '#0F172A' : '#1E293B',
                      borderRadius: '12px',
                      border: '1px solid ' + (isDark ? '#334155' : '#475569'),
                      color: '#F8FAFC',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.25)',
                    }}
                    itemStyle={{ color: '#38BDF8', fontWeight: 'bold' }}
                    labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Amount Highlight */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-400">
                  {lang === 'bn' ? 'মোট লেনদেন' : 'Total Amount'}
                </span>
                <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 tracking-tight font-mono">
                  {formatCurrency(totalPaymentAmount)}
                </span>
              </div>
            </div>
          )}

          {paymentBreakdownData.length > 0 && (
            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              {paymentBreakdownData.map((p, i) => {
                const percent = totalPaymentAmount > 0 ? Math.round((p.total_amount / totalPaymentAmount) * 100) : 0;
                return (
                  <div
                    key={p.payment_method}
                    className="flex flex-col p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 transition hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: PAYMENT_COLORS[i % PAYMENT_COLORS.length] }}
                        />
                        <span className="capitalize font-semibold text-xs text-slate-700 dark:text-slate-300 truncate">
                          {p.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {percent}%
                      </span>
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white font-mono tracking-tight">
                      {formatCurrency(p.total_amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Two Column Grid: Recent Sales & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {lang === 'bn' ? 'সাম্প্রতিক বিক্রয় চালান' : 'Recent Sales Invoices'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'bn' ? 'সর্বশেষ সম্পন্ন লেনদেনসমূহ' : 'Latest completed transactions'}
              </p>
            </div>
            <Link to="/sales" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              <span>{lang === 'bn' ? 'সব দেখুন' : 'View All'}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentSales.map((sale) => (
              <div key={sale.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{sale.invoice_number}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {sale.customer_name} • {new Date(sale.sale_date).toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 dark:text-white">{formatCurrency(sale.grand_total)}</div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                      sale.payment_status === 'paid'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {sale.payment_status === 'paid' ? (lang === 'bn' ? 'পরিশোধিত' : 'Paid') : (lang === 'bn' ? 'বকেয়া' : 'Due')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {lang === 'bn' ? 'কম স্টক সতর্কতা' : 'Low Stock Alerts'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'bn' ? 'যেসব পণ্যের পরিমাণ সতর্কতা মাত্রায় পৌঁছেছে' : 'Products reaching or below reorder threshold'}
              </p>
            </div>
            <Link to="/inventory" className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1">
              <span>{lang === 'bn' ? 'ইনভেন্টরি দেখুন' : 'View Stock'}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {lowStockAlerts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                {lang === 'bn' ? 'সব পণ্যের পর্যাপ্ত স্টক মজুদ রয়েছে!' : 'All products have healthy inventory levels!'}
              </div>
            ) : (
              lowStockAlerts.map((product) => (
                <div key={product.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {lang === 'bn' ? (product.name_bn || product.name) : product.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {lang === 'bn' ? 'বারকোড' : 'Barcode'}: {product.barcode}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-xs inline-block">
                      {lang === 'bn' ? 'মজুদ' : 'Stock'}: {formatNumber(Number(product.current_stock) % 1 === 0 ? Math.round(product.current_stock) : product.current_stock)} {lang === 'bn' ? 'পিস' : 'pcs'}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {lang === 'bn' ? 'সতর্কতা লেভেল' : 'Alert Level'}: {formatNumber(product.alert_stock)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
