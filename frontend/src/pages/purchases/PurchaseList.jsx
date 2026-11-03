import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  ShoppingBag,
  Plus,
  Search,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../../services/api';

export const PurchaseList = () => {
  const { t, formatCurrency, formatNumber } = useLanguage();
  const { error } = useToast();

  const [purchases, setPurchases] = useState([]);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases(pagination.current_page);
  }, [search]);

  const fetchPurchases = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/purchases', {
        params: { page, search: search || undefined },
      });
      setPurchases(res.data.data || []);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      });
    } catch (e) {
      error('ক্রয় তালিকা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('purchaseList')}
          </h1>
          <p className="text-sm text-slate-500">
            সরবরাহকারীদের থেকে পাইকারি পণ্য ক্রয় ও ইনভেন্টরি সরবরাহ হিসাব
          </p>
        </div>

        <Link
          to="/purchases/new"
          className="py-2.5 px-4 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-2 self-start transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t('newPurchase')}</span>
        </Link>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="চালান নম্বর বা সরবরাহকারীর নাম দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Purchases Table */}
      <div className="rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">চালান নম্বর</th>
                <th className="p-4">তারিখ</th>
                <th className="p-4">সরবরাহকারী</th>
                <th className="p-4 text-right">সর্বমোট বিল</th>
                <th className="p-4 text-right">পরিশোধিত</th>
                <th className="p-4 text-right">দেনা</th>
                <th className="p-4 text-center">পেমেন্ট অবস্থা</th>
                <th className="p-4 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center text-slate-400">লোড হচ্ছে...</td></tr>
              ) : purchases.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-slate-400">কোনো ক্রয়ের চালান পাওয়া যায়নি।</td></tr>
              ) : (
                purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{p.purchase_number}</td>
                    <td className="p-4 text-slate-500 font-mono">{p.purchase_date}</td>
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                      <div>{p.supplier?.name}</div>
                      {p.supplier?.company_name && <div className="text-[11px] text-slate-400 font-normal">{p.supplier.company_name}</div>}
                    </td>
                    <td className="p-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(p.grand_total)}
                    </td>
                    <td className="p-4 text-right text-emerald-600 font-semibold">
                      {formatCurrency(p.paid_amount)}
                    </td>
                    <td className="p-4 text-right text-amber-600 font-bold">
                      {formatCurrency(p.due_amount)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {p.payment_status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/purchases/${p.id}`}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg inline-block transition"
                      >
                        <Eye className="w-4 h-4" />
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
              onClick={() => fetchPurchases(pagination.current_page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchPurchases(pagination.current_page + 1)}
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
