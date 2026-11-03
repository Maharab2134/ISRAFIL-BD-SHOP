import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  Receipt,
  Search,
  Filter,
  Eye,
  Calendar,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
} from 'lucide-react';
import api from '../../services/api';

export const SaleList = () => {
  const { t, formatCurrency, formatNumber } = useLanguage();
  const { error } = useToast();

  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales(pagination.current_page);
  }, [search, startDate, endDate, paymentStatus]);

  const fetchSales = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/sales', {
        params: {
          page,
          search: search || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          payment_status: paymentStatus || undefined,
        },
      });
      setSales(res.data.data || []);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      });
    } catch (e) {
      error('বিক্রয় তালিকা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('saleList')}
          </h1>
          <p className="text-sm text-slate-500">
            সম্পন্ন সকল বিক্রয় চালান, রসিদ এবং পেমেন্ট বিবরণ
          </p>
        </div>

        <Link
          to="/pos"
          className="py-2.5 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2 self-start transition"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>নতুন পিওএস বিক্রয়</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="চালান নম্বর বা গ্রাহকের নাম..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

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

        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
        >
          <option value="">সকল পেমেন্ট স্ট্যাটাস</option>
          <option value="paid">পরিশোধিত (Paid)</option>
          <option value="partial">আংশিক বকেয়া (Partial)</option>
          <option value="due">সম্পূর্ণ বকেয়া (Due)</option>
        </select>
      </div>

      {/* Sales Table */}
      <div className="rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">চালান নম্বর</th>
                <th className="p-4">তারিখ ও সময়</th>
                <th className="p-4">গ্রাহক</th>
                <th className="p-4 text-center">আইটেম সংখ্যা</th>
                <th className="p-4 text-right">সর্বমোট বিল</th>
                <th className="p-4 text-right">পরিশোধিত</th>
                <th className="p-4 text-right">বকেয়া</th>
                <th className="p-4 text-center">অবস্থা</th>
                <th className="p-4 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="9" className="p-8 text-center text-slate-400">লোড হচ্ছে...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan="9" className="p-8 text-center text-slate-400">কোনো বিক্রয় চালান পাওয়া যায়নি।</td></tr>
              ) : (
                sales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-slate-900 dark:text-white font-mono">
                      {s.invoice_number}
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-[11px]">
                      {new Date(s.sale_date).toLocaleString('bn-BD')}
                    </td>
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                      <div>{s.customer_name}</div>
                      {s.customer_phone && <div className="text-[11px] text-slate-400 font-normal">{s.customer_phone}</div>}
                    </td>
                    <td className="p-4 text-center font-bold text-indigo-600">
                      {s.total_items}
                    </td>
                    <td className="p-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(s.grand_total)}
                    </td>
                    <td className="p-4 text-right text-emerald-600 font-semibold">
                      {formatCurrency(s.paid_amount)}
                    </td>
                    <td className="p-4 text-right text-rose-600 font-bold">
                      {formatCurrency(s.due_amount)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.sale_status === 'refunded'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : s.payment_status === 'paid'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {s.sale_status === 'refunded' ? 'ফেরত (Refunded)' : s.payment_status === 'paid' ? 'পরিশোধিত' : 'বকেয়া'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/sales/${s.id}`}
                        className="py-1 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ইনভয়েস</span>
                      </Link>
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
            পৃষ্ঠা {formatNumber(pagination.current_page)} / {formatNumber(pagination.last_page)}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.current_page <= 1}
              onClick={() => fetchSales(pagination.current_page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchSales(pagination.current_page + 1)}
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
