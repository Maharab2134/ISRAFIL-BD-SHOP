import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../../services/api';

export const SupplierList = () => {
  const { t, formatCurrency, formatNumber } = useLanguage();
  const { error } = useToast();

  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers(pagination.current_page);
  }, [search]);

  const fetchSuppliers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/suppliers', {
        params: { page, search: search || undefined },
      });
      setSuppliers(res.data.data || []);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      });
    } catch (e) {
      error('সরবরাহকারী তালিকা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('supplierList')}
          </h1>
          <p className="text-sm text-slate-500">
            মোট {formatNumber(pagination.total)} জন নিবন্ধিত সরবরাহকারী ও দেনা হিসাব
          </p>
        </div>

        <Link
          to="/suppliers/new"
          className="py-2.5 px-4 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-2 self-start transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addSupplier')}</span>
        </Link>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="সরবরাহকারীর নাম, কোম্পানি বা ফোন নম্বর দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">সরবরাহকারী ও প্রতিষ্ঠান</th>
                <th className="p-4">মোবাইল</th>
                <th className="p-4">ঠিকানা</th>
                <th className="p-4 text-center">মোট ক্রয়</th>
                <th className="p-4 text-right">দোকানের দেনা (Payable)</th>
                <th className="p-4 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">লোড হচ্ছে...</td></tr>
              ) : suppliers.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">কোনো সরবরাহকারী পাওয়া যায়নি।</td></tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      <div>{s.name}</div>
                      {s.company_name && <div className="text-[11px] text-slate-400 font-normal">{s.company_name}</div>}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-mono">{s.phone}</td>
                    <td className="p-4 text-slate-500">{s.address || '—'}</td>
                    <td className="p-4 text-center font-bold text-indigo-600">{s.purchases_count} টি</td>
                    <td className="p-4 text-right">
                      <span className={`font-black text-xs px-2.5 py-1 rounded-xl ${
                        Number(s.current_balance) > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'text-slate-500'
                      }`}>
                        {formatCurrency(s.current_balance)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/suppliers/${s.id}`}
                        className="py-1.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>লেজার ও পেমেন্ট</span>
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
              onClick={() => fetchSuppliers(pagination.current_page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchSuppliers(pagination.current_page + 1)}
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

