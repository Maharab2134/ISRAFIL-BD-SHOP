import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { RotateCcw, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';

export const SaleReturns = () => {
  const { t, formatCurrency, formatNumber } = useLanguage();
  const [returns, setReturns] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReturns(pagination.current_page);
  }, []);

  const fetchReturns = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/sales-returns', { params: { page } });
      setReturns(res.data.data || []);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('saleReturns')}
        </h1>
        <p className="text-sm text-slate-500">
          গ্রাহকদের থেকে পণ্য ফেরত গ্রহণ ও টাকা রিফান্ডের সম্পূর্ণ হিসাব
        </p>
      </div>

      <div className="rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">ফেরত নম্বর</th>
                <th className="p-4">তারিখ</th>
                <th className="p-4 text-right">চালানের মোট মূল্য</th>
                <th className="p-4 text-right">ফেরতকৃত টাকা (Refund)</th>
                <th className="p-4">ফেরতের মাধ্যম</th>
                <th className="p-4">অপারেটর</th>
                <th className="p-4">কারণ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">লোড হচ্ছে...</td></tr>
              ) : returns.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">কোনো ফেরতের রেকর্ড নেই।</td></tr>
              ) : (
                returns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-mono font-bold text-rose-600">{r.return_number}</td>
                    <td className="p-4 text-slate-500 font-mono">{r.return_date}</td>
                    <td className="p-4 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(r.total_amount)}</td>
                    <td className="p-4 text-right font-black text-rose-600">{formatCurrency(r.refund_amount)}</td>
                    <td className="p-4 capitalize text-slate-600 dark:text-slate-300">{r.payment_method}</td>
                    <td className="p-4 text-slate-700 dark:text-slate-200">{r.user?.name || 'সিস্টেম'}</td>
                    <td className="p-4 text-slate-500 text-[11px]">{r.reason || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            পৃষ্ঠা {formatNumber(pagination.current_page)} / {formatNumber(pagination.last_page)}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.current_page <= 1}
              onClick={() => fetchReturns(pagination.current_page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchReturns(pagination.current_page + 1)}
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

