import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { History, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';

export const StockHistory = () => {
  const { t, formatNumber } = useLanguage();
  const [movements, setMovements] = useState([]);
  const [movementType, setMovementType] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory(pagination.current_page);
  }, [movementType]);

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/inventory/history', {
        params: {
          page,
          movement_type: movementType || undefined,
        },
      });
      setMovements(res.data.data || []);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('stockHistory')}
          </h1>
          <p className="text-sm text-slate-500">
            ক্রয়, বিক্রয় ও সমন্বয় সংক্রান্ত সকল স্টক মুভমেন্ট লগ
          </p>
        </div>

        {/* Filter Type */}
        <select
          value={movementType}
          onChange={(e) => setMovementType(e.target.value)}
          className="py-2 px-3 text-xs rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">সকল মুভমেন্ট টাইপ</option>
          <option value="sale">বিক্রয় (Sale)</option>
          <option value="purchase">ক্রয় (Purchase)</option>
          <option value="adjustment_in">স্টক ইন (Adjustment In)</option>
          <option value="adjustment_out">স্টক আউট (Adjustment Out)</option>
          <option value="initial">প্রাথমিক স্টক (Initial)</option>
          <option value="sale_return">বিক্রয় ফেরত (Sale Return)</option>
        </select>
      </div>

      <div className="rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">তারিখ ও সময়</th>
                <th className="p-4">পণ্য</th>
                <th className="p-4 text-center">মুভমেন্ট টাইপ</th>
                <th className="p-4 text-right">আগের স্টক</th>
                <th className="p-4 text-center">পরিমাণ</th>
                <th className="p-4 text-right">পরবর্তী স্টক</th>
                <th className="p-4">ইউজার / অপারেটর</th>
                <th className="p-4">কারণ / রেফারেন্স</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center text-slate-400">লোড হচ্ছে...</td></tr>
              ) : movements.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-slate-400">কোনো হিস্টোরি রেকর্ড পাওয়া যায়নি।</td></tr>
              ) : (
                movements.map((m) => {
                  const isPositive = Number(m.quantity) >= 0;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-mono text-slate-500 text-[11px]">
                        {new Date(m.created_at).toLocaleString('bn-BD')}
                      </td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {m.product?.name}
                      </td>
                      <td className="p-4 text-center">
                        <span className="capitalize px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {m.movement_type}
                        </span>
                      </td>
                      <td className="p-4 text-right text-slate-500 font-semibold">{m.stock_before}</td>
                      <td className="p-4 text-center">
                        <span
                          className={`font-black text-xs px-2 py-0.5 rounded-lg ${
                            isPositive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {isPositive ? `+${m.quantity}` : m.quantity} {m.product?.unit?.name_bn}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-slate-900 dark:text-white">
                        {m.stock_after}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {m.user?.name || 'সিস্টেম'}
                      </td>
                      <td className="p-4 text-slate-500 text-[11px]">{m.reason || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            মোট {formatNumber(pagination.total)} টি রেকর্ডের মধ্যে পৃষ্ঠা {formatNumber(pagination.current_page)} / {formatNumber(pagination.last_page)}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.current_page <= 1}
              onClick={() => fetchHistory(pagination.current_page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchHistory(pagination.current_page + 1)}
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

