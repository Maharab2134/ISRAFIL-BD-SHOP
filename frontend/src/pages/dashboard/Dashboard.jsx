import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  const { t, formatCurrency, formatNumber } = useLanguage();
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
  }, []);

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

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('dashboard')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            দোকানের দৈনিক বিক্রয়, ইনভেন্টরি ও লাভ-ক্ষতির রিয়েলটাইম সারসংক্ষেপ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/pos"
            className="px-4 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2 transition"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>নতুন পিওএস বিক্রয়</span>
          </Link>
          <Link
            to="/products/new"
            className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>পণ্য যুক্ত করুন</span>
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
              <span>{formatNumber(kpis.sales_change_percent)}% গতকালের তুলনায়</span>
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
              {formatNumber(kpis.today_orders)} টি
            </div>
            <div className="mt-1 text-[11px] text-slate-400 font-medium">আজকের সম্পন্ন চালান</div>
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
            <div className="mt-1 text-[11px] text-slate-400 font-medium">বিক্রয় লাভ (COGS বাদে)</div>
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
            <div className="mt-1 text-[11px] text-slate-400 font-medium">দোকানের পরিচালন ব্যয়</div>
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
              {formatNumber(kpis.total_products)} প্রকার
            </div>
            <div className="mt-1 text-[11px] text-slate-400 font-medium">সক্রিয় পণ্যের আইটেম</div>
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
              {formatNumber(kpis.low_stock_count)} টি
            </div>
            <div className="mt-1 text-[11px] text-rose-500 font-medium">অবিলম্বে রি-অর্ডার প্রয়োজন</div>
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
                বিক্রয় ও লাভের প্রবণতা (বিগত ১৪ দিন)
              </h2>
              <p className="text-xs text-slate-500">প্রতিদিনের অর্জিত রাজস্ব ও মোট নিট মুনাফা</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-indigo-600" />
                <span className="text-slate-600 dark:text-slate-300">মোট বিক্রয়</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-300">লাভ</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.daily_trends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(val) => `৳${val}`} />
                <Tooltip
                  formatter={(val) => [`৳${val.toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" name="বিক্রয়" />
                <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#profitGrad)" name="লাভ" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Breakdown Chart (1 col) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              পেমেন্ট মাধ্যম বিশ্লেষণ
            </h2>
            <p className="text-xs text-slate-500">চলতি মাসের লেনদেন অনুপাত</p>
          </div>

          <div className="h-48 my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.payment_breakdown || []}
                  dataKey="total_amount"
                  nameKey="payment_method"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {(charts.payment_breakdown || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`৳${Number(val).toLocaleString()}`, 'মোট টাকা']}
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            {(charts.payment_breakdown || []).map((p, i) => (
              <div key={p.payment_method} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PAYMENT_COLORS[i % PAYMENT_COLORS.length] }} />
                <span className="capitalize font-medium text-slate-600 dark:text-slate-300 truncate">
                  {p.payment_method}: {formatCurrency(p.total_amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Sales & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">সাম্প্রতিক বিক্রয় চালান</h2>
              <p className="text-xs text-slate-500">সর্বশেষ সম্পন্ন লেনদেনসমূহ</p>
            </div>
            <Link to="/sales" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              <span>সব দেখুন</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentSales.map((sale) => (
              <div key={sale.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{sale.invoice_number}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {sale.customer_name} • {new Date(sale.sale_date).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
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
                    {sale.payment_status === 'paid' ? 'পরিশোধিত' : 'বকেয়া'}
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
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">কম স্টক সতর্কতা</h2>
              <p className="text-xs text-slate-500">যেসব পণ্যের পরিমাণ সতর্কতা মাত্রায় পৌঁছেছে</p>
            </div>
            <Link to="/inventory" className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1">
              <span>ইনভেন্টরি দেখুন</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {lowStockAlerts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                সব পণ্যের পর্যাপ্ত স্টক মজুদ রয়েছে!
              </div>
            ) : (
              lowStockAlerts.map((product) => (
                <div key={product.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{product.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      বারকোড: {product.barcode}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-xs inline-block">
                      মজুদ: {product.current_stock} {product.unit?.name_bn}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      সতর্কতা লেভেল: {product.alert_stock}
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

