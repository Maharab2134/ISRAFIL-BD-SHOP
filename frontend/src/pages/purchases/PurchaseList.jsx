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
  const { t, lang, formatCurrency, formatNumber } = useLanguage();
  const { error } = useToast();

  const [purchases, setPurchases] = useState([]);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases(pagination.current_page);
  }, [search, lang]);

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
      error(lang === 'bn' ? 'ক্রয় তালিকা লোড করতে সমস্যা হয়েছে।' : 'Failed to load purchase list.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'paid') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {lang === 'bn' ? 'পরিশোধিত' : 'Paid'}
        </span>
      );
    }
    if (status === 'partial') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          {lang === 'bn' ? 'আংশিক' : 'Partial'}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
        {lang === 'bn' ? 'বকেয়া' : 'Due'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-indigo-600" />
            {t('purchaseList')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'সরবরাহকারীদের থেকে পাইকারি পণ্য ক্রয় ও ইনভেন্টরি সরবরাহ হিসাব'
              : 'Wholesale purchases and inventory stock inward invoices'}
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
            placeholder={lang === 'bn' ? 'চালান নম্বর বা সরবরাহকারীর নাম দিয়ে খুঁজুন...' : 'Search by invoice number or supplier...'}
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
                <th className="p-4">{lang === 'bn' ? 'চালান নম্বর' : 'Invoice #'}</th>
                <th className="p-4">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                <th className="p-4">{lang === 'bn' ? 'সরবরাহকারী' : 'Supplier'}</th>
                <th className="p-4 text-right">{lang === 'bn' ? 'সর্বমোট বিল' : 'Total Amount'}</th>
                <th className="p-4 text-right">{lang === 'bn' ? 'পরিশোধিত' : 'Paid'}</th>
                <th className="p-4 text-right">{lang === 'bn' ? 'দেনা' : 'Due'}</th>
                <th className="p-4 text-center">{t('status')}</th>
                <th className="p-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    {t('loading')}
                  </td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {p.invoice_number}
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(p.purchase_date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {p.supplier?.name || '—'}
                    </td>
                    <td className="p-4 text-right font-black text-slate-900 dark:text-white">
                      {formatCurrency(p.grand_total)}
                    </td>
                    <td className="p-4 text-right text-emerald-600 font-semibold">
                      {formatCurrency(p.paid_amount)}
                    </td>
                    <td className="p-4 text-right">
                      <span className={`font-bold ${Number(p.due_amount) > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {formatCurrency(p.due_amount)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(p.payment_status)}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/purchases/${p.id}`}
                        className="py-1.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('view')}</span>
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
            {lang === 'bn'
              ? `পৃষ্ঠা ${formatNumber(pagination.current_page)} / ${formatNumber(pagination.last_page)}`
              : `Page ${formatNumber(pagination.current_page)} of ${formatNumber(pagination.last_page)}`}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.current_page <= 1}
              onClick={() => fetchPurchases(pagination.current_page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchPurchases(pagination.current_page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseList;
